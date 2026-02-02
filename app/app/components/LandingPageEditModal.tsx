import { FC, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { post } from "../utils/apiClient";
import { toast } from "react-hot-toast";

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface LandingPageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewHtml: string;
  generatedFiles: GeneratedFile[];
  landingPageId: string;
  token: string | null;
  onFilesUpdate: (files: GeneratedFile[]) => void;
  onSave: () => Promise<void>;
  hasChanges: boolean;
  onMarkDirty: () => void;
  teamMemberImageUrls?: (string | null)[];
  brandingImageUrls?: {
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    banner?: string | null;
  };
}

interface ElementInfo {
  outerHTML: string;
  tagName: string;
  selector: string;
}

function injectImagesIntoHtml(
  html: string,
  teamMemberImageUrls?: (string | null)[],
  brandingImageUrls?: {
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    banner?: string | null;
  }
): string {
  let result = html;

  if (brandingImageUrls) {
    const brandingMap: Record<string, string | null | undefined> = {
      "assets/primaryLogo.webp": brandingImageUrls.primaryLogo,
      "assets/secondaryLogo.webp": brandingImageUrls.secondaryLogo,
      "assets/banner.webp": brandingImageUrls.banner,
      "./assets/primaryLogo.webp": brandingImageUrls.primaryLogo,
      "./assets/secondaryLogo.webp": brandingImageUrls.secondaryLogo,
      "./assets/banner.webp": brandingImageUrls.banner,
    };

    Object.entries(brandingMap).forEach(([imagePath, dataUrl]) => {
      if (dataUrl) {
        result = result.replace(
          new RegExp(
            `src=["']${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "gi"
          ),
          `src="${dataUrl}"`
        );

        result = result.replace(
          new RegExp(
            `url\\(["']?${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?\\)`,
            "gi"
          ),
          `url('${dataUrl}')`
        );
      }
    });
  }

  if (teamMemberImageUrls && teamMemberImageUrls.length > 0) {
    teamMemberImageUrls.forEach((dataUrl, index) => {
      if (dataUrl) {
        const imagePath = `assets/team/member${index + 1}.webp`;

        result = result.split(`src="${imagePath}"`).join(`src="${dataUrl}"`);
        result = result.split(`src='${imagePath}'`).join(`src="${dataUrl}"`);
        result = result.split(`src="./${imagePath}"`).join(`src="${dataUrl}"`);
        result = result.split(`src='./${imagePath}'`).join(`src="${dataUrl}"`);

        result = result.split(`'${imagePath}'`).join(`'${dataUrl}'`);
        result = result.split(`"${imagePath}"`).join(`"${dataUrl}"`);
      }
    });
  }

  return result;
}

const LandingPageEditModal: FC<LandingPageEditModalProps> = ({
  isOpen,
  onClose,
  previewHtml,
  generatedFiles,
  landingPageId,
  token,
  onFilesUpdate,
  onSave,
  hasChanges,
  onMarkDirty,
  teamMemberImageUrls,
  brandingImageUrls,
}) => {
  const [elementPath, setElementPath] = useState<ElementInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isCtrlHeld, setIsCtrlHeld] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [panelPosition, setPanelPosition] = useState<"left" | "right">("right");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [pendingHtml, setPendingHtml] = useState<string | null>(null);

  const selectedElement = elementPath[selectedIndex] || null;

  const currentPreviewHtml = pendingHtml
    ? injectImagesIntoHtml(pendingHtml, teamMemberImageUrls, brandingImageUrls)
    : previewHtml;

  const sendToIframe = useCallback(
    (message: { type: string; index?: number }) => {
      iframeRef.current?.contentWindow?.postMessage(message, "*");
    },
    []
  );

  const selectElement = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      sendToIframe({ type: "select-index", index });
    },
    [sendToIframe]
  );

  const clearSelection = useCallback(() => {
    setElementPath([]);
    sendToIframe({ type: "clear-selection" });
  }, [sendToIframe]);

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const focusIframe = () => {
        iframeRef.current?.contentWindow?.focus();
      };
      focusIframe();
      const timer = setTimeout(focusIframe, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === "element-click") {
      const { path, clickX } = event.data;
      setElementPath(path);
      const clickedIndex = path.length - 1;
      setSelectedIndex(clickedIndex);
      setEditPrompt("");
      setPanelPosition(clickX < window.innerWidth / 2 ? "right" : "left");
    } else if (event.data.type === "ctrl-state") {
      setIsCtrlHeld(event.data.isCtrlHeld);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [isOpen, handleIframeMessage]);

  const getInjectedHtml = useCallback(() => {
    const script = `
      <style>
        .edit-mode-highlight {
          position: absolute;
          pointer-events: none;
          border: 2px solid #6366f1;
          background: rgba(99, 102, 241, 0.1);
          z-index: 99999;
          transition: all 0.1s ease;
        }
      </style>
      <script>
        let isCtrlHeld = false;
        let selectedElements = [];
        let currentSelectedIndex = 0;
        let highlightEl = null;
        
        function createHighlight() {
          if (!highlightEl) {
            highlightEl = document.createElement('div');
            highlightEl.className = 'edit-mode-highlight';
            document.body.appendChild(highlightEl);
          }
          return highlightEl;
        }
        
        function updateHighlight() {
          if (!highlightEl || selectedElements.length === 0) return;
          const el = selectedElements[currentSelectedIndex];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          highlightEl.style.top = (rect.top + window.scrollY) + 'px';
          highlightEl.style.left = (rect.left + window.scrollX) + 'px';
          highlightEl.style.width = rect.width + 'px';
          highlightEl.style.height = rect.height + 'px';
          highlightEl.style.display = 'block';
        }
        
        function hideHighlight() {
          if (highlightEl) highlightEl.style.display = 'none';
        }
        
        function getSelector(el) {
          let selector = el.tagName.toLowerCase();
          if (el.id) return selector + '#' + el.id;
          if (el.className && typeof el.className === 'string') {
            const cls = el.className.split(' ')
              .filter(c => c.trim() && !c.startsWith('hover:') && !c.startsWith('dark:'))
              .slice(0, 2).join('.');
            if (cls) selector += '.' + cls;
          }
          return selector;
        }
        
        function getElementPath(el, maxDepth = 5) {
          const path = [];
          const elements = [];
          let current = el;
          while (current && current !== document.body && path.length < maxDepth) {
            elements.push(current);
            path.push({
              outerHTML: current.outerHTML.slice(0, 500),
              tagName: current.tagName.toLowerCase(),
              selector: getSelector(current)
            });
            current = current.parentElement;
          }
          return { path: path.reverse(), elements: elements.reverse() };
        }
        
        window.addEventListener('message', (e) => {
          if (e.data.type === 'select-index') {
            currentSelectedIndex = e.data.index;
            updateHighlight();
          } else if (e.data.type === 'clear-selection') {
            selectedElements = [];
            hideHighlight();
          }
        });
        
        window.addEventListener('scroll', updateHighlight, true);
        window.addEventListener('resize', updateHighlight);
        
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Control' || e.key === 'Meta') {
            isCtrlHeld = true;
            document.body.style.cursor = 'crosshair';
            parent.postMessage({ type: 'ctrl-state', isCtrlHeld: true }, '*');
          }
        });
        
        document.addEventListener('keyup', (e) => {
          if (e.key === 'Control' || e.key === 'Meta') {
            isCtrlHeld = false;
            document.body.style.cursor = '';
            parent.postMessage({ type: 'ctrl-state', isCtrlHeld: false }, '*');
          }
        });
        
        document.addEventListener('click', (e) => {
          if (!isCtrlHeld) return;
          e.preventDefault();
          e.stopPropagation();
          
          createHighlight();
          const { path, elements } = getElementPath(e.target);
          selectedElements = elements;
          currentSelectedIndex = elements.length - 1;
          updateHighlight();
          
          parent.postMessage({
            type: 'element-click',
            path: path,
            clickX: e.clientX
          }, '*');
        }, true);
      <\/script>
    `;
    return currentPreviewHtml.replace("</body>", `${script}</body>`);
  }, [currentPreviewHtml]);

  const handleSubmitEdit = async () => {
    if (!selectedElement || !editPrompt.trim()) return;

    setIsProcessing(true);
    try {
      const response = await post<{
        updatedHtml: string;
      }>(
        `api/landing-page/${landingPageId}/edit-element`,
        {
          elementHtml: selectedElement.outerHTML,
          elementPath: selectedElement.selector,
          parentContext: elementPath
            .map(e => `<${e.tagName}>`)
            .reverse()
            .join(" > "),
          prompt: editPrompt,
          currentFiles: generatedFiles,
        },
        token
      );

      if (response?.updatedHtml) {
        setPendingHtml(response.updatedHtml);
        toast.success("Preview generated - accept or reject changes");
      } else {
        toast.error("Failed to generate changes");
      }
    } catch (error) {
      console.error("Error generating changes:", error);
      toast.error("Failed to generate changes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => {
    if (!pendingHtml) return;

    const updatedFiles = generatedFiles.map(file =>
      file.path === "index.html" ? { ...file, content: pendingHtml } : file
    );

    onFilesUpdate(updatedFiles);
    onMarkDirty();
    toast.success("Changes applied!");
    clearSelection();
    setEditPrompt("");
    setPendingHtml(null);
  };

  const handleReject = () => {
    setPendingHtml(null);
    toast("Changes discarded");
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingHtml) {
          handleReject();
        } else if (elementPath.length > 0) {
          clearSelection();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, elementPath.length, onClose, clearSelection, pendingHtml]);

  const handleIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.focus();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast.success("Changes deployed!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to deploy changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] bg-background-dark/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light/10 bg-background-card">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-200">
            {pendingHtml ? "Review Changes" : "Interactive Edit Mode"}
          </h2>

          {!pendingHtml && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-dark/50 border border-light/20">
                <span className="text-xs text-gray-400">
                  Hold{" "}
                  <kbd className="px-1.5 py-0.5 bg-background-dark rounded text-xs font-mono">
                    Ctrl
                  </kbd>{" "}
                  + Click to select
                </span>
              </div>
              {isCtrlHeld && (
                <span className="px-2 py-1 bg-primary/20 text-primary-light text-xs rounded">
                  Selection Active
                </span>
              )}
            </>
          )}

          {pendingHtml && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
              Previewing changes
            </span>
          )}

          {hasChanges && !pendingHtml && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingHtml ? (
            <>
              <Button
                onClick={handleAccept}
                variant="primary"
                size="sm"
                type="button"
              >
                <span className="flex items-center gap-1">
                  <div className="i-mdi:check h-4 w-4"></div>
                  Accept
                </span>
              </Button>
              <Button
                onClick={handleReject}
                variant="secondary"
                size="sm"
                type="button"
              >
                <span className="flex items-center gap-1">
                  <div className="i-mdi:close h-4 w-4"></div>
                  Reject
                </span>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                type="button"
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <div className="i-mdi:loading animate-spin h-4 w-4"></div>
                    Deploying...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="i-mdi:cloud-upload h-4 w-4"></div>
                    Save & Deploy
                  </span>
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                size="sm"
                type="button"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          ref={iframeRef}
          srcDoc={getInjectedHtml()}
          className="w-full h-full border-0"
          title="Landing Page Preview"
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleIframeLoad}
        />

        {/* Floating Edit Panel */}
        {selectedElement && !pendingHtml && (
          <div
            className="fixed z-[51] bg-background-card/95 backdrop-blur-sm border border-light/30 rounded-lg shadow-2xl p-4 w-96 max-h-[80vh] overflow-y-auto"
            style={{
              top: "80px",
              [panelPosition]: "16px",
            }}
            data-higher-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-200">Edit Element</h3>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-200"
                type="button"
              >
                <div className="i-mdi:close h-5 w-5"></div>
              </button>
            </div>

            {/* Element Path Selector */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Select element:</div>
              <div className="flex flex-wrap gap-1">
                {elementPath.slice(0, 5).map((el, index) => (
                  <button
                    key={index}
                    onClick={() => selectElement(index)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50"
                    }`}
                    type="button"
                  >
                    &lt;{el.tagName}&gt;
                    {el.selector !== el.tagName && (
                      <span className="text-gray-500 ml-1">
                        {el.selector.replace(el.tagName, "")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Current HTML Preview */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">Current HTML:</div>
              <pre className="p-2 bg-background-dark rounded text-xs text-gray-400 overflow-auto max-h-24 whitespace-pre-wrap break-all border border-light/10">
                {selectedElement.outerHTML.slice(0, 300)}
                {selectedElement.outerHTML.length > 300 && "..."}
              </pre>
            </div>

            {/* Edit Prompt */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">
                Describe changes:
              </div>
              <textarea
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                placeholder="e.g., Make the text larger and change color to blue"
                className="w-full p-2 bg-background-dark border border-light/20 rounded text-sm text-gray-200 resize-none focus:outline-none focus:border-primary/50"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitEdit}
              variant="primary"
              size="sm"
              type="button"
              disabled={!editPrompt.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="i-mdi:loading animate-spin h-4 w-4"></div>
                  Generating...
                </span>
              ) : (
                "Generate Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageEditModal;
