import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import {
  convertImageToBinary,
  extractImageFromClipboard,
  DEFAULT_DIMENSIONS,
  getImageDimensions,
  CropParams,
} from "../utils/imageUtils";
import { Card } from "./Card";
import { useModal } from "../context/ModalContext";
import { toast } from "react-toastify";
import { Button } from "./Button";
import { useTranslation } from "~/i18n";

type ImageType =
  | "primaryLogo"
  | "secondaryLogo"
  | "favicon"
  | "pnlPoster"
  | "banner"
  | "logo";

interface ImagePasteProps {
  id: string;
  label: string | ReactNode;
  value?: Blob;
  onChange: (blob: Blob | null) => void;
  imageType: ImageType;
  helpText?: string;
}

export default function ImagePaste({
  id,
  label,
  value,
  onChange,
  imageType,
  helpText,
}: ImagePasteProps) {
  const { openModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const originalImageRef = useRef<string | null>(null);
  const originalDimensionsRef = useRef<{
    width: number;
    height: number;
  } | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dimensions = DEFAULT_DIMENSIONS[imageType];
  const { t } = useTranslation();

  const enforceSquare =
    imageType === "secondaryLogo" ||
    imageType === "favicon" ||
    imageType === "logo";

  const enforce16by9 = imageType === "pnlPoster";

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (value) {
      const newUrl = URL.createObjectURL(value);
      setPreviewUrl(newUrl);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [value]);

  const processAndSaveImage = useCallback(
    async (
      imageDataUrl: string,
      cropParams?: CropParams,
      customDimensions?: { width: number; height: number }
    ) => {
      setIsProcessing(true);

      try {
        const croppedWidth = customDimensions?.width || dimensions.width;
        const croppedHeight = customDimensions?.height || dimensions.height;

        let targetWidth = croppedWidth;
        let targetHeight = croppedHeight;

        const needsWidthResize = croppedWidth > dimensions.width;
        const needsHeightResize = croppedHeight > dimensions.height;

        if (needsWidthResize || needsHeightResize) {
          const widthScale = dimensions.width / croppedWidth;
          const heightScale = dimensions.height / croppedHeight;

          const scale = Math.min(widthScale, heightScale);

          targetWidth = Math.round(croppedWidth * scale);
          targetHeight = Math.round(croppedHeight * scale);
        }

        const processedImageBlob = await convertImageToBinary(
          imageDataUrl,
          targetWidth,
          targetHeight,
          "contain",
          cropParams
        );

        onChange(processedImageBlob);
      } catch (error) {
        console.error("Image processing error:", error);
        toast.error(t("imagePaste.failedToProcess"));
      } finally {
        setIsProcessing(false);
      }
    },
    [dimensions, onChange]
  );

  const processImageAndOpenCropModal = useCallback(
    async (imageDataUrl: string) => {
      if (!imageDataUrl) {
        console.error("No image data provided");
        toast.error(t("imagePaste.noImageDataProvided"));
        setIsProcessing(false);
        return;
      }

      originalImageRef.current = imageDataUrl;

      try {
        const imageDims = await getImageDimensions(imageDataUrl);
        originalDimensionsRef.current = imageDims;

        let initialCrop: CropParams;

        if (imageType === "primaryLogo") {
          initialCrop = {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height,
          };
        } else if (imageType === "pnlPoster") {
          const aspectRatio = 16 / 9;
          let cropWidth = imageDims.width;
          let cropHeight = imageDims.width / aspectRatio;

          if (cropHeight > imageDims.height) {
            cropHeight = imageDims.height;
            cropWidth = imageDims.height * aspectRatio;
          }

          const x = Math.max(0, (imageDims.width - cropWidth) / 2);
          const y = Math.max(0, (imageDims.height - cropHeight) / 2);

          initialCrop = {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(cropWidth),
            height: Math.round(cropHeight),
          };
        } else if (imageType === "banner") {
          initialCrop = {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height,
          };
        } else {
          const maxSquareSize = Math.min(imageDims.width, imageDims.height);
          initialCrop = {
            x: 0,
            y: 0,
            width: maxSquareSize,
            height: maxSquareSize,
          };
        }

        const handleApplyCropForThisImage = async (
          cropParams: CropParams,
          finalDimensions: { width: number; height: number }
        ) => {
          const imageSource = originalImageRef.current;

          if (!imageSource) {
            console.error("Missing original image source");
            return;
          }

          if (cropParams.width <= 0 || cropParams.height <= 0) {
            console.error("Invalid crop dimensions");
            return;
          }

          await processAndSaveImage(imageSource, cropParams, finalDimensions);
        };

        openModal("imageCrop", {
          imageSource: imageDataUrl,
          originalDimensions: imageDims,
          initialCrop,
          targetDimensions: dimensions,
          enforceSquare,
          enforce16by9,
          onApply: handleApplyCropForThisImage,
        });

        setIsProcessing(false);
      } catch (error) {
        console.error(
          "Error getting image dimensions or processing image:",
          error
        );
        toast.error(t("imagePaste.couldNotProcessInvalidImage"));
        setIsProcessing(false);
      }
    },
    [openModal, processAndSaveImage, imageType, enforceSquare, enforce16by9]
  );

  const handlePaste = useCallback(
    async (event?: ClipboardEvent | React.ClipboardEvent<HTMLDivElement>) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        let imageDataUrl: string | null = null;

        if (event) {
          let nativeEventToUse: ClipboardEvent;
          if ("nativeEvent" in event) {
            (event as React.ClipboardEvent<HTMLDivElement>).preventDefault();
            nativeEventToUse = (event as React.ClipboardEvent<HTMLDivElement>)
              .nativeEvent;
          } else {
            (event as ClipboardEvent).preventDefault();
            nativeEventToUse = event as ClipboardEvent;
          }
          imageDataUrl = await extractImageFromClipboard(nativeEventToUse);
        } else {
          try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
              for (const type of clipboardItem.types) {
                if (type.startsWith("image/")) {
                  const blob = await clipboardItem.getType(type);
                  imageDataUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e =>
                      resolve((e.target?.result as string) || null);
                    reader.readAsDataURL(blob);
                  });
                  break;
                }
              }
              if (imageDataUrl) break;
            }
          } catch (err) {
            console.error("Clipboard API error:", err);
            toast.error(t("imagePaste.couldNotAccessClipboard"));
            pasteAreaRef.current?.focus();
            setIsProcessing(false);
            return;
          }
        }

        if (!imageDataUrl) {
          console.error("No image found in clipboard");
          toast.error(t("imagePaste.noImageInClipboard"));
          setIsProcessing(false);
          return;
        }

        await processImageAndOpenCropModal(imageDataUrl);
      } catch (error) {
        console.error("Image paste error:", error);
        setIsProcessing(false);
      }
    },
    [isProcessing, processImageAndOpenCropModal]
  );

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (isProcessing) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (imageDataUrl) {
        await processImageAndOpenCropModal(imageDataUrl);
      } else {
        toast.error(t("imagePaste.couldNotReadSelectedFile"));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("File selection error:", error);
      toast.error(t("imagePaste.failedToLoadSelectedImage"));
      setIsProcessing(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    originalImageRef.current = null;
    originalDimensionsRef.current = null;
    onChange(null);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handlePasteButtonClick = async () => {
    await handlePaste();
  };

  const handleSelectFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-sm font-bold text-gray-200">
          {label}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-error hover:text-error/70 transition-colors"
            disabled={isProcessing}
          >
            {t("imagePaste.clear")}
          </button>
        )}
      </div>

      <div className="mt-1">
        {previewUrl ? (
          <div className="relative group border border-light/15 rounded-lg p-2 flex justify-center items-center bg-base-8/30 min-h-[150px]">
            <img
              src={previewUrl}
              alt={`${imageType} preview`}
              className="max-h-40 max-w-full object-contain rounded"
            />
            <button
              onClick={handleClear}
              className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all focus:opacity-100"
              aria-label="Remove image"
              type="button"
              disabled={isProcessing}
            >
              <div className="i-mdi:close h-3 w-3"></div>
            </button>
          </div>
        ) : (
          <div
            ref={pasteAreaRef}
            tabIndex={0}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors min-h-[150px] flex flex-col justify-center items-center
              ${isFocused ? "border-primary-light bg-primary-light/5" : "border-light/20 hover:border-light/30 bg-base-8/20"}
              ${isProcessing ? "opacity-60 cursor-default pointer-events-none" : ""}`}
            onPaste={
              handlePaste as (
                event: React.ClipboardEvent<HTMLDivElement>
              ) => void
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pasteAreaRef.current?.focus();
              }
            }}
            role="button"
            aria-label={label ? String(label) : "Paste image area"}
          >
            <div
              className={`mx-auto mb-2 ${isFocused ? "text-primary-light" : "text-gray-400"}`}
            >
              <div className="i-mdi:image-outline h-10 w-10 mx-auto"></div>
            </div>
            <p
              className={`text-sm ${isFocused ? "text-gray-200" : "text-gray-400"} mb-1`}
            >
              {isProcessing
                ? t("imagePaste.processing")
                : t("imagePaste.dragDropPasteOr")}
            </p>
            {!isProcessing && (
              <button
                type="button"
                onClick={handleSelectFileButtonClick}
                className="text-sm text-primary-light hover:underline focus:outline-none focus:ring-1 focus:ring-primary-light rounded px-1"
              >
                {t("imagePaste.selectFileLink")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          type="button"
          onClick={handlePasteButtonClick}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          disabled={isProcessing}
          isLoading={isProcessing && originalImageRef.current === null}
          loadingText={t("imagePaste.pasting")}
        >
          <span className="flex items-center justify-center gap-1.5">
            <div className="i-mdi:content-paste h-4 w-4"></div>
            {t("imagePaste.pasteImageButton")}
          </span>
        </Button>
        <Button
          type="button"
          onClick={handleSelectFileButtonClick}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          disabled={isProcessing}
          isLoading={isProcessing && originalImageRef.current === null}
          loadingText={t("imagePaste.selecting")}
        >
          <span className="flex items-center justify-center gap-1.5">
            <div className="i-mdi:file-image-plus-outline h-4 w-4"></div>
            {t("imagePaste.selectFileButton")}
          </span>
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*,image/webp,image/jpeg,image/png,image/gif"
        style={{ display: "none" }}
        disabled={isProcessing}
      />

      {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}

      <Card variant="default" className="p-3 text-xs text-gray-400 mt-3">
        <p>
          <span className="font-medium text-primary-light">
            {t("imagePaste.recommendedSizeLabel")}:
          </span>{" "}
          {dimensions.width}x{dimensions.height}px
        </p>
        <p className="mt-1">{t("imagePaste.recommendedSizeDescription")}</p>
      </Card>
    </div>
  );
}
