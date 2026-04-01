"use client";

import { useState, useTransition } from "react";
import {
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtaskText,
} from "@/app/actions/subtask-actions";

type Subtask = {
  id: number;
  todoId: number;
  text: string;
  completed: boolean;
  position: number;
  createdAt: Date;
};

export function SubtaskList({
  todoId,
  initialSubtasks,
}: {
  todoId: number;
  initialSubtasks: Subtask[];
}) {
  const [subs, setSubs] = useState(initialSubtasks);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isPending, startTransition] = useTransition();

  const completedCount = subs.filter((s) => s.completed).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;

    const optimistic: Subtask = {
      id: Date.now(),
      todoId,
      text,
      completed: false,
      position: subs.length,
      createdAt: new Date(),
    };
    setSubs((prev) => [...prev, optimistic]);
    setNewText("");

    startTransition(async () => {
      await addSubtask(todoId, text);
      const { getSubtasks } = await import("@/app/actions/subtask-actions");
      const fresh = await getSubtasks(todoId);
      setSubs(fresh);
    });
  }

  async function handleToggle(id: number) {
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
    startTransition(async () => {
      await toggleSubtask(id, todoId);
    });
  }

  async function handleDelete(id: number) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    startTransition(async () => {
      await deleteSubtask(id, todoId);
    });
  }

  function handleEditStart(sub: Subtask) {
    setEditingId(sub.id);
    setEditText(sub.text);
  }

  async function handleEditSave(id: number) {
    const text = editText.trim();
    if (!text) return;
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
    setEditingId(null);
    startTransition(async () => {
      await updateSubtaskText(id, text, todoId);
    });
  }

  return (
    <div className="subtask-section">
      <div className="subtask-header">
        <h2 className="notes-heading">Steps</h2>
        {subs.length > 0 && (
          <span className="subtask-progress">
            {completedCount}/{subs.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {subs.length > 0 && (
        <div className="subtask-bar">
          <div
            className="subtask-bar-fill"
            style={{ width: `${(completedCount / subs.length) * 100}%` }}
          />
        </div>
      )}

      {subs.map((sub, idx) => (
        <div
          key={sub.id}
          className={`subtask-item todo-enter`}
          style={{ animationDelay: `${idx * 25}ms` }}
        >
          <button
            className={`subtask-check ${sub.completed ? "checked" : ""}`}
            onClick={() => handleToggle(sub.id)}
            aria-label={sub.completed ? "Mark incomplete" : "Mark complete"}
          />
          {editingId === sub.id ? (
            <input
              className="subtask-text editing"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => handleEditSave(sub.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSave(sub.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
            />
          ) : (
            <span
              className={`subtask-text ${sub.completed ? "completed" : ""}`}
              onDoubleClick={() => handleEditStart(sub)}
            >
              {sub.text}
            </span>
          )}
          <button
            className="subtask-delete"
            onClick={() => handleDelete(sub.id)}
            aria-label="Delete"
          >
            &times;
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="subtask-add">
        <span className="subtask-add-icon">+</span>
        <input
          className="subtask-add-input"
          placeholder="Add a step..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
      </form>
    </div>
  );
}
