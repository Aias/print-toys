import { Canvas, loadImage, createCanvas, Image } from "canvas";
import { LINE_WIDTH_PX } from "./constants";

interface ProcessedImage {
  canvas: Canvas;
  width: number;
  height: number;
}

interface ImageAdjustments {
  contrast: number;
  brightness: number;
  gamma: number;
}

const defaultAdjustments: ImageAdjustments = {
  contrast: 1,
  brightness: 0,
  gamma: 1,
};

async function processImage(
  image: Image,
  adjustments: ImageAdjustments = defaultAdjustments
): Promise<ProcessedImage> {
  let { width, height } = image;

  // Calculate new dimensions while maintaining aspect ratio
  if (width > LINE_WIDTH_PX) {
    const aspectRatio = width / height;
    width = LINE_WIDTH_PX;
    height = Math.round(width / aspectRatio);
  }

  // Ensure width and height are multiples of 8
  width = Math.floor(width / 8) * 8;
  height = Math.floor(height / 8) * 8;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw the image
  ctx.drawImage(image, 0, 0, width, height);

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Apply adjustments
  for (let i = 0; i < data.length; i += 4) {
    // Apply gamma correction
    data[i] = Math.pow(data[i] / 255, adjustments.gamma) * 255;
    data[i + 1] = Math.pow(data[i + 1] / 255, adjustments.gamma) * 255;
    data[i + 2] = Math.pow(data[i + 2] / 255, adjustments.gamma) * 255;

    // Apply contrast
    for (let j = 0; j < 3; j++) {
      data[i + j] =
        ((data[i + j] / 255 - 0.5) * adjustments.contrast + 0.5) * 255;
    }

    // Apply brightness
    data[i] += adjustments.brightness;
    data[i + 1] += adjustments.brightness;
    data[i + 2] += adjustments.brightness;

    // Clamp values
    data[i] = Math.max(0, Math.min(255, data[i]));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
  }

  // Put the modified image data back to the canvas
  ctx.putImageData(imageData, 0, 0);

  return { canvas, width, height };
}

export async function urlToCanvasImage(
  url: string,
  adjustments?: ImageAdjustments
): Promise<ProcessedImage> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const image = await loadImage(buffer);
    return processImage(image, adjustments);
  } catch (error) {
    console.error("Error processing image from URL:", error);
    throw error;
  }
}

export async function rawDataToCanvasImage(
  rawData: Buffer,
  adjustments?: ImageAdjustments
): Promise<ProcessedImage> {
  try {
    const image = await loadImage(rawData);
    return processImage(image, adjustments);
  } catch (error) {
    console.error("Error processing raw image data:", error);
    throw error;
  }
}
