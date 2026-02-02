import { useState } from "react";
import { Button } from "./Button";

export interface FaqItem {
  question: string;
  answer: string;
}

interface EditableFaqListProps {
  items: FaqItem[];
  onItemsChange: (items: FaqItem[]) => void;
  label: string;
  description: string;
  placeholderQuestion?: string;
  placeholderAnswer?: string;
  emptyMessage: string;
}

export default function EditableFaqList({
  items,
  onItemsChange,
  label,
  description,
  placeholderQuestion = "Enter a question...",
  placeholderAnswer = "Enter an answer...",
  emptyMessage,
}: EditableFaqListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAdd = () => {
    const question = newQuestion.trim();
    const answer = newAnswer.trim();
    if (question && answer) {
      onItemsChange([...items, { question, answer }]);
      setNewQuestion("");
      setNewAnswer("");
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditQuestion(items[index]?.question || "");
    setEditAnswer(items[index]?.answer || "");
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editQuestion.trim() && editAnswer.trim()) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      };
      onItemsChange(updatedItems);
      setEditingIndex(null);
      setEditQuestion("");
      setEditAnswer("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditQuestion("");
    setEditAnswer("");
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

        {/* Add new FAQ item */}
        <div className="space-y-2 mb-4 p-4 bg-background-light rounded-lg border border-gray-700">
          <input
            type="text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder={placeholderQuestion}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <textarea
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            placeholder={placeholderAnswer}
            rows={3}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={!newQuestion.trim() || !newAnswer.trim()}
          >
            <div className="i-mdi:plus h-4 w-4 mr-1"></div>
            Add FAQ
          </Button>
        </div>

        {/* FAQ items list */}
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
                      value={editQuestion}
                      onChange={e => setEditQuestion(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      placeholder={placeholderQuestion}
                      className="w-full p-2 bg-background-light border border-gray-600 rounded text-white focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <textarea
                      value={editAnswer}
                      onChange={e => setEditAnswer(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      placeholder={placeholderAnswer}
                      rows={3}
                      className="w-full p-2 bg-background-light border border-gray-600 rounded text-white focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editQuestion.trim() || !editAnswer.trim()}
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
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">
                          {item.question}
                        </h4>
                        <p className="text-sm text-gray-300">{item.answer}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="p-1.5 rounded hover:bg-primary/20 text-gray-400 hover:text-primary-light transition-colors"
                          title="Edit FAQ"
                        >
                          <div className="i-mdi:pencil h-4 w-4"></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1.5 rounded hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors"
                          title="Remove FAQ"
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
          {items.length} FAQ item(s) added
        </p>
      </div>
    </div>
  );
}
