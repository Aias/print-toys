import { data } from "react-router";
import type { Route } from "./+types/actions.print-image";
import { rawDataToCanvasImage } from "~/lib/image-processing";
import { createEncoder } from "~/lib/encoder";
import { createAndPrintJob } from "~/api/requests";

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const imageData = formData.get("image") as File;

    if (!imageData) {
      return data(
        { success: false, message: "No image data provided" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await imageData.arrayBuffer());
    const { canvas, width, height } = await rawDataToCanvasImage(buffer);

    const encoder = createEncoder();
    encoder.image(canvas, width, height, "atkinson");

    const printData = encoder.cut().encode();

    await createAndPrintJob(printData);

    return data({ success: true, message: "Image added to print queue" });
  } catch (error) {
    console.error("Error processing image for printing:", error);
    return data(
      {
        success: false,
        message: `Failed to process image for printing: ${(error as Error).message}`,
      },
      { status: 500 },
    );
  }
};
