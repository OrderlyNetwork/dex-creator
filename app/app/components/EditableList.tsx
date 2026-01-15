import { useState } from "react";
import { Button } from "./Button";

interface EditableListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  label: string;
  description: string;
  placeholder: string;
  emptyMessage: string;
}

export default function EditableList({
  items,
  onItemsChange,
  label,
  description,
  placeholder,
  emptyMessage,
}: EditableListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const newItem = editValue.trim();
    if (newItem) {
      onItemsChange([...items, newItem]);
      setEditValue("");
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index] || "");
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = editValue.trim();
      onItemsChange(updatedItems);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleRemove = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <p className="text-xs text-gray-400 mb-2">{description}</p>

        {/* Add new item */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && editingIndex === null) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={editingIndex !== null ? "Edit item..." : placeholder}
            className="flex-1 p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          {editingIndex !== null ? (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
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
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={!editValue.trim()}
            >
              <div className="i-mdi:plus h-4 w-4 mr-1"></div>
              Add
            </Button>
          )}
        </div>

        {/* Items list */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <div className="i-mdi:information-outline h-8 w-8 mx-auto mb-2"></div>
              {emptyMessage}
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-background-dark border border-gray-700 rounded-lg"
              >
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="flex-1 p-2 bg-background-light border border-gray-600 rounded text-white focus:outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="flex-1 text-gray-300">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="p-1.5 rounded hover:bg-primary/20 text-gray-400 hover:text-primary-light transition-colors"
                      title="Edit item"
                    >
                      <div className="i-mdi:pencil h-4 w-4"></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 rounded hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors"
                      title="Remove item"
                    >
                      <div className="i-mdi:delete h-4 w-4"></div>
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {items.length} item(s) added
        </p>
      </div>
    </div>
  );
}
