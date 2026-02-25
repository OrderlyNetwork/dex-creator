import decodeJpeg from "@jsquash/jpeg/decode";
import decodePng from "@jsquash/png/decode";
import decodeWebp from "@jsquash/webp/decode";
import encodeWebp from "@jsquash/webp/encode";
import resize from "@jsquash/resize";
import { i18n } from "~/i18n";

export const DEFAULT_DIMENSIONS = {
  primaryLogo: { width: 600, height: 120 },
  secondaryLogo: { width: 120, height: 120 },
  favicon: { width: 96, height: 96 },
  pnlPoster: { width: 960, height: 540 },
  banner: { width: 1200, height: 630 },
  logo: { width: 400, height: 400 },
};

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert an image to a WebP base64 data URI with optional cropping and resizing
 * @param base64Icon Base64 data URI of source image
 * @param width Optional width to resize to
 * @param height Optional height to resize to
 * @param fitMethod Resizing method ('contain' or 'stretch')
 * @param cropParams Optional parameters for cropping before resize: {x, y, width, height}
 * @returns Promise resolving to WebP base64 data URI
 */
export async function convertImage(
  base64Icon: string,
  width?: number,
  height?: number,
  fitMethod: "contain" | "stretch" = "contain",
  cropParams?: CropParams
): Promise<string> {
  try {
    const base64Data = base64Icon.replace(/^data:[^,]+,/, "");

    const imageBuffer = Uint8Array.from(atob(base64Data), v => v.charCodeAt(0));

    let sourceType: "jpeg" | "png" | "webp";
    if (base64Icon.includes("image/png")) {
      sourceType = "png";
    } else if (base64Icon.includes("image/jpeg")) {
      sourceType = "jpeg";
    } else if (base64Icon.includes("image/webp")) {
      sourceType = "webp";
    } else {
      throw new Error(i18n.t("imageUtils.unsupportedFormat"));
    }

    let decodedImage = await decode(sourceType, imageBuffer);

    if (cropParams && cropParams.width > 0 && cropParams.height > 0) {
      decodedImage = cropImage(decodedImage, cropParams);
    }

    const resizedImage =
      width && height
        ? await resize(decodedImage, {
            width,
            height,
            fitMethod,
          })
        : decodedImage;

    const encodedImage = await encode(resizedImage);

    let binaryString = "";
    const bytes = new Uint8Array(encodedImage);
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64String = btoa(binaryString);

    return `data:image/webp;base64,${base64String}`;
  } catch (error) {
    console.error("Error processing image:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(i18n.t("imageUtils.failedToProcess", { message }));
  }
}

/**
 * Crop an image to the specified dimensions
 * @param imageData Source image data
 * @param cropParams Crop parameters: {x, y, width, height}
 * @returns Cropped ImageData
 */
function cropImage(imageData: ImageData, cropParams: CropParams): ImageData {
  const canvas = new OffscreenCanvas(cropParams.width, cropParams.height);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(i18n.t("imageUtils.canvasContextError"));
  }

  const sourceCanvas = new OffscreenCanvas(imageData.width, imageData.height);
  const sourceCtx = sourceCanvas.getContext("2d");

  if (!sourceCtx) {
    throw new Error(i18n.t("imageUtils.sourceCanvasContextError"));
  }

  sourceCtx.putImageData(imageData, 0, 0);

  ctx.drawImage(
    sourceCanvas,
    cropParams.x,
    cropParams.y,
    cropParams.width,
    cropParams.height,
    0,
    0,
    cropParams.width,
    cropParams.height
  );

  return ctx.getImageData(0, 0, cropParams.width, cropParams.height);
}

/**
 * Decode an image buffer to ImageData based on its format
 */
async function decode(
  sourceType: "jpeg" | "png" | "webp",
  fileBuffer: Uint8Array
): Promise<ImageData> {
  let result: ImageData;
  switch (sourceType) {
    case "jpeg":
      // @ts-ignore - The JSQuash types don't match perfectly, but the library works with Uint8Array
      result = await decodeJpeg(fileBuffer);
      break;
    case "png":
      // @ts-ignore - The JSQuash types don't match perfectly, but the library works with Uint8Array
      result = await decodePng(fileBuffer);
      break;
    case "webp":
      // @ts-ignore - The JSQuash types don't match perfectly, but the library works with Uint8Array
      result = await decodeWebp(fileBuffer);
      break;
    default:
      throw new Error(i18n.t("imageUtils.unknownSourceType", { sourceType }));
  }
  return result;
}

/**
 * Encode ImageData to WebP format
 */
async function encode(imageData: ImageData): Promise<ArrayBuffer> {
  return encodeWebp(imageData, {
    quality: 80, // Using a lossy compression with good quality
  });
}

/**
 * Get source image dimensions from a base64 data URI
 * @param base64Image Base64 data URI of source image
 * @returns Promise resolving to {width, height}
 */
export function getImageDimensions(
  base64Image: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error(i18n.t("imageUtils.failedToLoadForDimensions")));
    };
    img.src = base64Image;
  });
}

/**
 * Extract a base64 data URI from a clipboard paste event
 */
export function extractImageFromClipboard(
  event: ClipboardEvent
): Promise<string | null> {
  return new Promise(resolve => {
    const items = event.clipboardData?.items;

    if (!items) {
      resolve(null);
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();

        if (!blob) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result;
          resolve(typeof result === "string" ? result : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
        return;
      }
    }

    resolve(null);
  });
}

/**
 * Convert an image to a WebP binary Blob with optional cropping and resizing
 * @param base64Icon Base64 data URI of source image
 * @param width Optional width to resize to
 * @param height Optional height to resize to
 * @param fitMethod Resizing method ('contain' or 'stretch')
 * @param cropParams Optional parameters for cropping before resize: {x, y, width, height}
 * @returns Promise resolving to WebP binary Blob
 */
export async function convertImageToBinary(
  base64Icon: string,
  width?: number,
  height?: number,
  fitMethod: "contain" | "stretch" = "contain",
  cropParams?: CropParams
): Promise<Blob> {
  try {
    const base64Data = base64Icon.replace(/^data:[^,]+,/, "");

    const imageBuffer = Uint8Array.from(atob(base64Data), v => v.charCodeAt(0));

    let sourceType: "jpeg" | "png" | "webp";
    if (base64Icon.includes("image/png")) {
      sourceType = "png";
    } else if (base64Icon.includes("image/jpeg")) {
      sourceType = "jpeg";
    } else if (base64Icon.includes("image/webp")) {
      sourceType = "webp";
    } else {
      throw new Error(i18n.t("imageUtils.unsupportedFormat"));
    }

    let decodedImage = await decode(sourceType, imageBuffer);

    if (cropParams && cropParams.width > 0 && cropParams.height > 0) {
      decodedImage = cropImage(decodedImage, cropParams);
    }

    const resizedImage =
      width && height
        ? await resize(decodedImage, {
            width,
            height,
            fitMethod,
          })
        : decodedImage;

    const encodedImage = await encode(resizedImage);

    return new Blob([encodedImage], { type: "image/webp" });
  } catch (error) {
    console.error("Error processing image:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(i18n.t("imageUtils.failedToProcess", { message }));
  }
}
