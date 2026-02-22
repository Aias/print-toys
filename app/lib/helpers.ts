import * as usb from 'usb';
import { USB_VENDOR_ID, USB_PRODUCT_ID, USB_INTERFACE_NUMBER } from './constants';

export async function sendToPrinter(data: Uint8Array, debug: boolean = false) {
  return new Promise<void>((resolve, reject) => {
    try {
      // Find the printer device
      const device = usb.findByIds(USB_VENDOR_ID, USB_PRODUCT_ID);

      if (!device) {
        reject(
          new Error(
            `USB printer not found (VID: ${USB_VENDOR_ID.toString(16)}, PID: ${USB_PRODUCT_ID.toString(16)})`
          )
        );
        return;
      }

      if (debug) console.log('Found USB printer:', device.deviceDescriptor);

      // Open the device
      device.open();

      // Get the interface
      const iface = device.interface(USB_INTERFACE_NUMBER);

      // Detach kernel driver if active (Linux/Mac may need this)
      if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
      }

      // Claim the interface
      iface.claim();

      // Find the OUT endpoint (direction: host to device)
      const endpoint = iface.endpoints.find((ep) => ep.direction === 'out') as usb.OutEndpoint;

      if (!endpoint) {
        device.close();
        reject(new Error('OUT endpoint not found on USB printer'));
        return;
      }

      if (debug)
        console.log(
          `Sending ${data.length} bytes to USB printer on endpoint ${endpoint.address}...`
        );

      // Send data to printer
      endpoint.transfer(Buffer.from(data), (error) => {
        // Release interface and close device
        try {
          iface.release(true, () => {
            device.close();
          });
        } catch (e) {
          console.error('Error releasing USB interface:', e);
        }

        if (error) {
          reject(error);
        } else {
          if (debug) console.log('USB print successful');
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
