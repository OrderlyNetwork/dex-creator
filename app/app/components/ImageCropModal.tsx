import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { CropParams } from "../utils/imageUtils";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (
    cropParams: CropParams,
    finalDimensions: { width: number; height: number }
  ) => Promise<void>;
  imageSource: string;
  originalDimensions: { width: number; height: number };
  initialCrop: CropParams;
  targetDimensions: { width: number; height: number };
  enforceSquare?: boolean;
  enforce16by9?: boolean;
}

type HandlePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export default function ImageCropModal({
  isOpen,
  onClose,
  onApply,
  imageSource,
  originalDimensions,
  initialCrop,
  targetDimensions,
  enforceSquare = false,
  enforce16by9 = false,
}: ImageCropModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cropDimensions, setCropDimensions] = useState<CropParams>(initialCrop);
  const [finalDimensions, setFinalDimensions] = useState({
    width: initialCrop.width,
    height: initialCrop.height,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [scale, setScale] = useState(1);

  const cropDimensionsRef = useRef<CropParams>(cropDimensions);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartCropRef = useRef<CropParams | null>(null);
  const isDraggingRef = useRef(false);
  const activeHandleRef = useRef<HandlePosition | null>(null);
  const scaleRef = useRef(1);

  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropPreviewRef = useRef<HTMLDivElement>(null);

  const calculateFinalDimensions = useCallback(
    (cropWidth: number, cropHeight: number) => {
      const needsWidthResize = cropWidth > targetDimensions.width;
      const needsHeightResize = cropHeight > targetDimensions.height;

      if (needsWidthResize || needsHeightResize) {
        const widthScale = targetDimensions.width / cropWidth;
        const heightScale = targetDimensions.height / cropHeight;

        const scale = Math.min(widthScale, heightScale);

        return {
          width: Math.round(cropWidth * scale),
          height: Math.round(cropHeight * scale),
        };
      }

      return {
        width: cropWidth,
        height: cropHeight,
      };
    },
    [targetDimensions]
  );

  const handleApply = useCallback(async () => {
    if (cropDimensions.width <= 0 || cropDimensions.height <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onApply(cropDimensions, finalDimensions);
      onClose();
    } catch (error) {
      console.error("Error applying crop:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cropDimensions, finalDimensions, onApply, onClose]);

  useEffect(() => {
    cropDimensionsRef.current = cropDimensions;
  }, [cropDimensions]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    activeHandleRef.current = activeHandle;
  }, [activeHandle]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    setCropDimensions(initialCrop);
    setFinalDimensions(
      calculateFinalDimensions(initialCrop.width, initialCrop.height)
    );
  }, [initialCrop, calculateFinalDimensions]);

  useEffect(() => {
    setFinalDimensions(
      calculateFinalDimensions(cropDimensions.width, cropDimensions.height)
    );
  }, [calculateFinalDimensions, cropDimensions.width, cropDimensions.height]);

  useEffect(() => {
    if (isOpen && imageSource && cropCanvasRef.current && originalDimensions) {
      updateCropPreview();
    }
  }, [isOpen, cropDimensions, imageSource]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading) {
        e.preventDefault();
        handleApply();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, handleApply]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        !isDraggingRef.current ||
        !cropCanvasRef.current ||
        !dragStartCropRef.current
      )
        return;

      const canvas = cropCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const deltaX = (mouseX - dragStartPosRef.current.x) / scaleRef.current;
      const deltaY = (mouseY - dragStartPosRef.current.y) / scaleRef.current;

      let newCrop = { ...dragStartCropRef.current };

      switch (activeHandleRef.current) {
        case "center":
          newCrop.x = Math.max(
            0,
            Math.min(
              originalDimensions.width - newCrop.width,
              newCrop.x + deltaX
            )
          );
          newCrop.y = Math.max(
            0,
            Math.min(
              originalDimensions.height - newCrop.height,
              newCrop.y + deltaY
            )
          );
          break;

        case "top-left":
          if (enforceSquare) {
            const delta = Math.max(deltaX, deltaY);
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + delta)
            );
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + delta)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
            );
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height = newCrop.width / (16 / 9);
          } else {
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
            );
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height =
              dragStartCropRef.current.y +
              dragStartCropRef.current.height -
              newCrop.y;
          }
          break;

        case "top-right":
          if (enforceSquare) {
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
            );
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width - deltaY
              )
            );
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
            );
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width + deltaX
              )
            );
            newCrop.height = newCrop.width / (16 / 9);
          } else {
            newCrop.y = Math.max(
              0,
              Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
            );
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width + deltaX
              )
            );
            newCrop.height =
              dragStartCropRef.current.y +
              dragStartCropRef.current.height -
              newCrop.y;
          }
          break;

        case "bottom-left":
          if (enforceSquare) {
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height = newCrop.width / (16 / 9);
          } else {
            newCrop.x = Math.max(
              0,
              Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
            );
            newCrop.width =
              dragStartCropRef.current.x +
              dragStartCropRef.current.width -
              newCrop.x;
            newCrop.height = Math.max(
              10,
              Math.min(
                originalDimensions.height - newCrop.y,
                dragStartCropRef.current.height + deltaY
              )
            );
          }
          break;

        case "bottom-right":
          if (enforceSquare) {
            const delta = Math.max(deltaX, deltaY);
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width + delta
              )
            );
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width + deltaX
              )
            );
            newCrop.height = newCrop.width / (16 / 9);
          } else {
            newCrop.width = Math.max(
              10,
              Math.min(
                originalDimensions.width - newCrop.x,
                dragStartCropRef.current.width + deltaX
              )
            );
            newCrop.height = Math.max(
              10,
              Math.min(
                originalDimensions.height - newCrop.y,
                dragStartCropRef.current.height + deltaY
              )
            );
          }
          break;

        case "top":
          newCrop.y = Math.max(
            0,
            Math.min(newCrop.y + newCrop.height - 10, newCrop.y + deltaY)
          );
          newCrop.height =
            dragStartCropRef.current.y +
            dragStartCropRef.current.height -
            newCrop.y;
          if (enforceSquare) {
            newCrop.width = newCrop.height;
          } else if (enforce16by9) {
            newCrop.width = newCrop.height * (16 / 9);
          }
          break;

        case "bottom":
          newCrop.height = Math.max(
            10,
            Math.min(
              originalDimensions.height - newCrop.y,
              dragStartCropRef.current.height + deltaY
            )
          );
          if (enforceSquare) {
            newCrop.width = newCrop.height;
          } else if (enforce16by9) {
            newCrop.width = newCrop.height * (16 / 9);
          }
          break;

        case "left":
          newCrop.x = Math.max(
            0,
            Math.min(newCrop.x + newCrop.width - 10, newCrop.x + deltaX)
          );
          newCrop.width =
            dragStartCropRef.current.x +
            dragStartCropRef.current.width -
            newCrop.x;
          if (enforceSquare) {
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.height = newCrop.width / (16 / 9);
          }
          break;

        case "right":
          newCrop.width = Math.max(
            10,
            Math.min(
              originalDimensions.width - newCrop.x,
              dragStartCropRef.current.width + deltaX
            )
          );
          if (enforceSquare) {
            newCrop.height = newCrop.width;
          } else if (enforce16by9) {
            newCrop.height = newCrop.width / (16 / 9);
          }
          break;
      }

      newCrop.width = Math.max(10, newCrop.width);
      newCrop.height = Math.max(10, newCrop.height);

      const roundedCrop = {
        x: Math.round(newCrop.x),
        y: Math.round(newCrop.y),
        width: Math.round(newCrop.width),
        height: Math.round(newCrop.height),
      };

      setCropDimensions(roundedCrop);
      setFinalDimensions(
        calculateFinalDimensions(roundedCrop.width, roundedCrop.height)
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      isDraggingRef.current = false;
      activeHandleRef.current = null;

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }

    return undefined;
  }, [
    isDragging,
    enforceSquare,
    enforce16by9,
    originalDimensions,
    calculateFinalDimensions,
  ]);

  if (!isOpen) return null;

  const updateCropPreview = () => {
    if (!cropCanvasRef.current || !imageSource) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      const maxPreviewSize = 300;
      const calculatedScale = Math.min(
        maxPreviewSize / img.width,
        maxPreviewSize / img.height
      );

      setScale(calculatedScale);

      canvas.width = img.width * calculatedScale;
      canvas.height = img.height * calculatedScale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaledX = cropDimensions.x * calculatedScale;
      const scaledY = cropDimensions.y * calculatedScale;
      const scaledWidth = cropDimensions.width * calculatedScale;
      const scaledHeight = cropDimensions.height * calculatedScale;

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

      ctx.fillRect(0, 0, canvas.width, scaledY);
      ctx.fillRect(0, scaledY, scaledX, scaledHeight);
      ctx.fillRect(
        scaledX + scaledWidth,
        scaledY,
        canvas.width - (scaledX + scaledWidth),
        scaledHeight
      );
      ctx.fillRect(
        0,
        scaledY + scaledHeight,
        canvas.width,
        canvas.height - (scaledY + scaledHeight)
      );

      ctx.strokeStyle = "rgb(89, 91, 255)";
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      const handleSize = 8;

      drawHandle(
        ctx,
        scaledX - handleSize / 2,
        scaledY - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX + scaledWidth - handleSize / 2,
        scaledY - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX - handleSize / 2,
        scaledY + scaledHeight - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX + scaledWidth - handleSize / 2,
        scaledY + scaledHeight - handleSize / 2,
        handleSize,
        handleSize
      );

      drawHandle(
        ctx,
        scaledX + scaledWidth / 2 - handleSize / 2,
        scaledY - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX + scaledWidth / 2 - handleSize / 2,
        scaledY + scaledHeight - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX - handleSize / 2,
        scaledY + scaledHeight / 2 - handleSize / 2,
        handleSize,
        handleSize
      );
      drawHandle(
        ctx,
        scaledX + scaledWidth - handleSize / 2,
        scaledY + scaledHeight / 2 - handleSize / 2,
        handleSize,
        handleSize
      );
    };
    img.src = imageSource;
  };

  const drawHandle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgb(89, 91, 255)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  };

  const handleCropChange = (key: keyof CropParams, value: number) => {
    let newValue = Math.max(0, Math.round(value));

    if (key === "x") {
      newValue = Math.min(
        newValue,
        originalDimensions.width - cropDimensions.width
      );
    } else if (key === "y") {
      newValue = Math.min(
        newValue,
        originalDimensions.height - cropDimensions.height
      );
    } else if (key === "width") {
      newValue = Math.min(
        newValue,
        originalDimensions.width - cropDimensions.x
      );

      if (enforceSquare) {
        setCropDimensions(prev => ({
          ...prev,
          height: newValue,
          width: newValue,
        }));
        return;
      }

      if (enforce16by9) {
        const newHeight = newValue / (16 / 9);
        setCropDimensions(prev => ({
          ...prev,
          width: newValue,
          height: newHeight,
        }));
        setFinalDimensions(calculateFinalDimensions(newValue, newHeight));
        return;
      }
    } else if (key === "height") {
      newValue = Math.min(
        newValue,
        originalDimensions.height - cropDimensions.y
      );

      if (enforceSquare) {
        setCropDimensions(prev => ({
          ...prev,
          width: newValue,
          height: newValue,
        }));
        return;
      }

      if (enforce16by9) {
        const newWidth = newValue * (16 / 9);
        setCropDimensions(prev => ({
          ...prev,
          height: newValue,
          width: newWidth,
        }));
        setFinalDimensions(calculateFinalDimensions(newWidth, newValue));
        return;
      }
    }

    setCropDimensions(prev => ({
      ...prev,
      [key]: newValue,
    }));

    if (key === "width" || key === "height") {
      const updatedCrop = { ...cropDimensions, [key]: newValue };
      setFinalDimensions(
        calculateFinalDimensions(updatedCrop.width, updatedCrop.height)
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropCanvasRef.current) return;

    const canvas = cropCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    dragStartPosRef.current = { x: mouseX, y: mouseY };
    dragStartCropRef.current = { ...cropDimensions };

    const scaledX = cropDimensions.x * scale;
    const scaledY = cropDimensions.y * scale;
    const scaledWidth = cropDimensions.width * scale;
    const scaledHeight = cropDimensions.height * scale;
    const handleSize = 10;

    if (isNear(mouseX, mouseY, scaledX, scaledY, handleSize)) {
      setActiveHandle("top-left");
      activeHandleRef.current = "top-left";
    } else if (
      isNear(mouseX, mouseY, scaledX + scaledWidth, scaledY, handleSize)
    ) {
      setActiveHandle("top-right");
      activeHandleRef.current = "top-right";
    } else if (
      isNear(mouseX, mouseY, scaledX, scaledY + scaledHeight, handleSize)
    ) {
      setActiveHandle("bottom-left");
      activeHandleRef.current = "bottom-left";
    } else if (
      isNear(
        mouseX,
        mouseY,
        scaledX + scaledWidth,
        scaledY + scaledHeight,
        handleSize
      )
    ) {
      setActiveHandle("bottom-right");
      activeHandleRef.current = "bottom-right";
    } else if (
      isNear(
        mouseX,
        mouseY,
        scaledX + scaledWidth / 2,
        scaledY,
        handleSize,
        true
      )
    ) {
      setActiveHandle("top");
      activeHandleRef.current = "top";
    } else if (
      isNear(
        mouseX,
        mouseY,
        scaledX + scaledWidth / 2,
        scaledY + scaledHeight,
        handleSize,
        true
      )
    ) {
      setActiveHandle("bottom");
      activeHandleRef.current = "bottom";
    } else if (
      isNear(
        mouseX,
        mouseY,
        scaledX,
        scaledY + scaledHeight / 2,
        handleSize,
        true
      )
    ) {
      setActiveHandle("left");
      activeHandleRef.current = "left";
    } else if (
      isNear(
        mouseX,
        mouseY,
        scaledX + scaledWidth,
        scaledY + scaledHeight / 2,
        handleSize,
        true
      )
    ) {
      setActiveHandle("right");
      activeHandleRef.current = "right";
    } else if (
      mouseX >= scaledX &&
      mouseX <= scaledX + scaledWidth &&
      mouseY >= scaledY &&
      mouseY <= scaledY + scaledHeight
    ) {
      setActiveHandle("center");
      activeHandleRef.current = "center";
    } else {
      return;
    }

    setIsDragging(true);
    isDraggingRef.current = true;
  };

  const isNear = (
    mouseX: number,
    mouseY: number,
    pointX: number,
    pointY: number,
    threshold: number,
    isEdge = false
  ) => {
    if (isEdge) {
      return (
        Math.abs(mouseX - pointX) <= threshold &&
        Math.abs(mouseY - pointY) <= threshold
      );
    }
    return (
      Math.abs(mouseX - pointX) <= threshold &&
      Math.abs(mouseY - pointY) <= threshold
    );
  };

  const getCursor = () => {
    if (!activeHandle) return "default";

    switch (activeHandle) {
      case "top-left":
        return "nwse-resize";
      case "top-right":
        return "nesw-resize";
      case "bottom-left":
        return "nesw-resize";
      case "bottom-right":
        return "nwse-resize";
      case "top":
        return "ns-resize";
      case "bottom":
        return "ns-resize";
      case "left":
        return "ew-resize";
      case "right":
        return "ew-resize";
      case "center":
        return "move";
      default:
        return "default";
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[2001]"
        onClick={isLoading ? undefined : onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative z-[2002] min-h-screen flex items-center justify-center p-2 sm:p-4">
        {/* Modal */}
        <div className="w-full max-w-4xl p-4 sm:p-6 rounded-xl bg-background-light border border-light/10 shadow-2xl slide-fade-in my-4 sm:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Crop Image</h3>

          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Crop preview */}
            <div className="flex-grow flex justify-center">
              <div ref={cropPreviewRef} className="relative">
                <canvas
                  ref={cropCanvasRef}
                  className="border border-light/20 rounded-md max-w-full max-h-[300px]"
                  width={300}
                  height={300}
                  onMouseDown={handleMouseDown}
                  style={{ cursor: getCursor() }}
                ></canvas>
                <div className="text-xs text-gray-400 text-center mt-2">
                  Drag to move, handles to resize
                </div>
              </div>
            </div>

            {/* Crop controls */}
            <div className="flex flex-col gap-3 min-w-[150px] lg:min-w-[200px]">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block">X</label>
                    <input
                      type="number"
                      value={cropDimensions.x}
                      onChange={e =>
                        handleCropChange("x", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-dark/50 border border-light/10 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Y</label>
                    <input
                      type="number"
                      value={cropDimensions.y}
                      onChange={e =>
                        handleCropChange("y", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-dark/50 border border-light/10 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block">Width</label>
                    <input
                      type="number"
                      value={cropDimensions.width}
                      onChange={e =>
                        handleCropChange("width", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-dark/50 border border-light/10 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">
                      Height
                    </label>
                    <input
                      type="number"
                      value={cropDimensions.height}
                      onChange={e =>
                        handleCropChange("height", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-dark/50 border border-light/10 rounded-lg text-xs"
                      disabled={enforceSquare}
                    />
                  </div>
                </div>
                {enforceSquare && (
                  <p className="text-xs text-gray-400">
                    This image type requires a square aspect ratio
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-3">
                <p>
                  Original size: {originalDimensions.width}x
                  {originalDimensions.height}px
                </p>
                <p>
                  Crop size: {cropDimensions.width}x{cropDimensions.height}px
                </p>
                <p>
                  Final output size: {finalDimensions.width}x
                  {finalDimensions.height}px
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max size: {targetDimensions.width}x{targetDimensions.height}px
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              isLoading={isLoading}
              loadingText="Applying"
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
