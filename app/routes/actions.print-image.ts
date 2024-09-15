import { rawDataToCanvasImage } from "~/lib/image-processing";
import { createEncoder } from "~/lib/encoder";
import { createPrintJob } from "~/api/requests";
import { ActionFunctionArgs, json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const imageData = formData.get("image") as File;
    const contrast = Number(formData.get("contrast")) || 1.2;
    const brightness = Number(formData.get("brightness")) || 10;
    const gamma = Number(formData.get("gamma")) || 1.0;

    if (!imageData) {
      return json(
        { success: false, message: "No image data provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageData.arrayBuffer());
    const { canvas, width, height } = await rawDataToCanvasImage(buffer, {
      contrast,
      brightness,
      gamma,
    });

    const encoder = createEncoder();
    encoder.image(canvas, width, height, "atkinson");

    const printData = encoder.encode();

    // Create print job
    await createPrintJob(Buffer.from(printData));

    return json({ success: true, message: "Image added to print queue" });
  } catch (error) {
    console.error("Error processing image for printing:", error);
    return json(
      {
        success: false,
        message: `Failed to process image for printing: ${
          (error as Error).message
        }`,
      },
      { status: 500 }
    );
  }
};
