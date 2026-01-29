import { useState, useCallback, useRef } from "react";
import { Button } from "./Button";

export interface TeamMemberLink {
  label: string;
  url: string;
}

export interface TeamMember {
  name: string;
  description: string;
  links: TeamMemberLink[];
  image?: Blob | null;
}

interface EditableTeamListProps {
  items: TeamMember[];
  onItemsChange: (items: TeamMember[]) => void;
  label: string;
  description: string;
  placeholderName?: string;
  placeholderDescription?: string;
  emptyMessage: string;
}

export default function EditableTeamList({
  items,
  onItemsChange,
  label,
  description,
  placeholderName = "Enter team member name...",
  placeholderDescription = "Enter description...",
  emptyMessage,
}: EditableTeamListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLinks, setEditLinks] = useState<TeamMemberLink[]>([]);
  const [editImage, setEditImage] = useState<Blob | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLinks, setNewLinks] = useState<TeamMemberLink[]>([]);
  const [newImage, setNewImage] = useState<Blob | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const newFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (
      file: File,
      setImage: (blob: Blob | null) => void,
      setPreview: (url: string | null) => void
    ) => {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    },
    []
  );

  const handleAddLink = (
    links: TeamMemberLink[],
    setLinks: (links: TeamMemberLink[]) => void
  ) => {
    setLinks([...links, { label: "", url: "" }]);
  };

  const handleUpdateLink = (
    links: TeamMemberLink[],
    setLinks: (links: TeamMemberLink[]) => void,
    index: number,
    field: "label" | "url",
    value: string
  ) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleRemoveLink = (
    links: TeamMemberLink[],
    setLinks: (links: TeamMemberLink[]) => void,
    index: number
  ) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    const name = newName.trim();
    const desc = newDescription.trim();
    if (name) {
      onItemsChange([
        ...items,
        {
          name,
          description: desc,
          links: newLinks.filter(link => link.label.trim() && link.url.trim()),
          image: newImage,
        },
      ]);
      setNewName("");
      setNewDescription("");
      setNewLinks([]);
      setNewImage(null);
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
        setNewImagePreview(null);
      }
    }
  };

  const handleEdit = (index: number) => {
    const member = items[index];
    setEditingIndex(index);
    setEditName(member?.name || "");
    setEditDescription(member?.description || "");
    setEditLinks([...(member?.links || [])]);
    setEditImage(member?.image || null);
    if (member?.image) {
      setEditImagePreview(URL.createObjectURL(member.image));
    } else {
      setEditImagePreview(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editName.trim()) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = {
        name: editName.trim(),
        description: editDescription.trim(),
        links: editLinks.filter(link => link.label.trim() && link.url.trim()),
        image: editImage,
      };
      onItemsChange(updatedItems);
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
    setEditDescription("");
    setEditLinks([]);
    setEditImage(null);
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
      setEditImagePreview(null);
    }
  };

  const handleRemove = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const renderLinks = (
    links: TeamMemberLink[],
    setLinks: (links: TeamMemberLink[]) => void,
    isEditing: boolean
  ) => {
    return (
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-300">Links</label>
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddLink(links, setLinks)}
            >
              <div className="i-mdi:plus h-3 w-3 mr-1"></div>
              Add Link
            </Button>
          )}
        </div>
        {links.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No links added</p>
        ) : (
          links.map((link, linkIndex) => (
            <div key={linkIndex} className="flex gap-2 items-start">
              <input
                type="text"
                value={link.label}
                onChange={e =>
                  handleUpdateLink(
                    links,
                    setLinks,
                    linkIndex,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Link label (e.g., Twitter, LinkedIn)"
                disabled={!isEditing}
                className={`flex-1 p-2 text-sm ${
                  isEditing
                    ? "bg-background-light border border-gray-600 rounded text-white"
                    : "bg-transparent border-0 text-gray-300"
                } focus:outline-none focus:border-primary`}
              />
              <input
                type="url"
                value={link.url}
                onChange={e =>
                  handleUpdateLink(
                    links,
                    setLinks,
                    linkIndex,
                    "url",
                    e.target.value
                  )
                }
                placeholder="https://..."
                disabled={!isEditing}
                className={`flex-1 p-2 text-sm ${
                  isEditing
                    ? "bg-background-light border border-gray-600 rounded text-white"
                    : "bg-transparent border-0 text-gray-300"
                } focus:outline-none focus:border-primary`}
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(links, setLinks, linkIndex)}
                  className="p-1.5 rounded hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors"
                  title="Remove link"
                >
                  <div className="i-mdi:delete h-4 w-4"></div>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderImageUpload = (
    image: Blob | null,
    preview: string | null,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    onFileSelect: (file: File) => void,
    onClear: () => void
  ) => {
    return (
      <div className="mt-2">
        <label className="text-xs font-medium text-gray-300 block mb-2">
          Photo (optional)
        </label>
        <div className="flex items-center gap-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Team member"
                className="w-16 h-16 rounded-full object-cover border border-gray-600"
              />
              <button
                type="button"
                onClick={onClear}
                className="absolute -top-1 -right-1 p-1 bg-danger rounded-full text-white hover:bg-danger/80"
                title="Remove photo"
              >
                <div className="i-mdi:close h-3 w-3"></div>
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-background-dark border border-gray-600 flex items-center justify-center">
              <div className="i-mdi:account h-8 w-8 text-gray-500"></div>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="i-mdi:upload h-4 w-4 mr-1"></div>
            {image ? "Change" : "Upload"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <p className="text-xs text-gray-400 mb-2">{description}</p>

        <div className="space-y-2 mb-4 p-4 bg-background-light rounded-lg border border-gray-700">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={placeholderName}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder={placeholderDescription}
            rows={3}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
          />
          {renderImageUpload(
            newImage,
            newImagePreview,
            newFileInputRef,
            file => handleImageSelect(file, setNewImage, setNewImagePreview),
            () => {
              setNewImage(null);
              if (newImagePreview) {
                URL.revokeObjectURL(newImagePreview);
                setNewImagePreview(null);
              }
            }
          )}
          {renderLinks(newLinks, setNewLinks, true)}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={!newName.trim()}
          >
            <div className="i-mdi:plus h-4 w-4 mr-1"></div>
            Add Team Member
          </Button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <div className="i-mdi:information-outline h-8 w-8 mx-auto mb-2"></div>
              {emptyMessage}
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-background-dark border border-gray-700 rounded-lg space-y-2"
              >
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      placeholder={placeholderName}
                      className="w-full p-2 bg-background-light border border-gray-600 rounded text-white focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      placeholder={placeholderDescription}
                      rows={3}
                      className="w-full p-2 bg-background-light border border-gray-600 rounded text-white focus:outline-none focus:border-primary resize-none"
                    />
                    {renderImageUpload(
                      editImage,
                      editImagePreview,
                      editFileInputRef,
                      file =>
                        handleImageSelect(
                          file,
                          setEditImage,
                          setEditImagePreview
                        ),
                      () => {
                        setEditImage(null);
                        if (editImagePreview) {
                          URL.revokeObjectURL(editImagePreview);
                          setEditImagePreview(null);
                        }
                      }
                    )}
                    {renderLinks(editLinks, setEditLinks, true)}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      {item.image && (
                        <img
                          src={URL.createObjectURL(item.image)}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-300 mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.links.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-light hover:text-primary hover:underline"
                              >
                                {link.label || link.url}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-1.5 rounded hover:bg-primary/20 text-gray-400 hover:text-primary-light transition-colors"
                          title="Edit team member"
                        >
                          <div className="i-mdi:pencil h-4 w-4"></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1.5 rounded hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors"
                          title="Remove team member"
                        >
                          <div className="i-mdi:delete h-4 w-4"></div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {items.length} team member(s) added
        </p>
      </div>
    </div>
  );
}
