"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodoText,
  reorderTodos,
  toggleDoNow,
} from "./actions/todo-actions";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  doNow: boolean;
  position: number;
  createdAt: Date;
};

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;

    const optimisticTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      doNow: false,
      position: todos.length,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, optimisticTodo]);
    setNewText("");

    startTransition(async () => {
      await addTodo(text);
      // Refresh from server
      const { getTodos } = await import("./actions/todo-actions");
      const fresh = await getTodos();
      setTodos(fresh);
    });
  }

  async function handleToggle(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    startTransition(async () => {
      await toggleTodo(id);
    });
  }

  async function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      await deleteTodo(id);
    });
  }

  function handleEditStart(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  async function handleEditSave(id: number) {
    const text = editText.trim();
    if (!text) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
    setEditingId(null);
    startTransition(async () => {
      await updateTodoText(id, text);
    });
  }

  async function handleDoNow(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, doNow: !t.doNow } : t))
    );
    startTransition(async () => {
      await toggleDoNow(id);
    });
  }

  // Sort: doNow items first, then by position
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.doNow && !b.doNow) return -1;
    if (!a.doNow && b.doNow) return 1;
    return a.position - b.position;
  });

  // Drag and drop
  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDragLeave() {
    setDragOverIdx(null);
  }

  async function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...todos];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setTodos(reordered);
    setDragIdx(null);
    setDragOverIdx(null);

    startTransition(async () => {
      await reorderTodos(reordered.map((t) => t.id));
    });
  }

  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  // Touch drag support
  const touchState = useRef<{
    idx: number;
    startY: number;
    currentIdx: number;
  } | null>(null);

  function handleTouchStart(idx: number, e: React.TouchEvent) {
    const touch = e.touches[0];
    touchState.current = { idx, startY: touch.clientY, currentIdx: idx };
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchState.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.querySelectorAll("[data-todo-idx]");
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const idx = parseInt(el.getAttribute("data-todo-idx")!, 10);
        touchState.current.currentIdx = idx;
        setDragOverIdx(idx);
        setDragIdx(touchState.current.idx);
        break;
      }
    }
  }

  function handleTouchEnd() {
    if (touchState.current) {
      const { idx, currentIdx } = touchState.current;
      if (idx !== currentIdx) {
        handleDrop(currentIdx);
      }
      touchState.current = null;
      setDragIdx(null);
      setDragOverIdx(null);
    }
  }

  return (
    <div>
      {sortedTodos.map((todo, idx) => (
        <div
          key={todo.id}
          data-todo-idx={idx}
          className={`ruled-line todo-item todo-enter ${
            dragIdx === idx ? "dragging" : ""
          } ${dragOverIdx === idx && dragIdx !== idx ? "drag-over" : ""} ${
            todo.doNow ? "do-now" : ""
          }`}
          style={{ animationDelay: `${idx * 30}ms` }}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(idx)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(idx, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="drag-grip" aria-hidden="true" />
          <span className="todo-num">{idx + 1}.</span>
          <button
            className={`todo-check ${todo.completed ? "checked" : ""}`}
            onClick={() => handleToggle(todo.id)}
            aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
          />
          {editingId === todo.id ? (
            <input
              className="todo-text editing"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => handleEditSave(todo.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSave(todo.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
            />
          ) : (
            <span
              className={`todo-text clickable ${todo.completed ? "completed" : ""}`}
              onClick={() => router.push(`/todo/${todo.id}`)}
            >
              {todo.text}
            </span>
          )}
          <button
            className={`do-now-btn ${todo.doNow ? "active" : ""}`}
            onClick={() => handleDoNow(todo.id)}
            aria-label={todo.doNow ? "Remove focus" : "Do this now"}
            title={todo.doNow ? "Remove focus" : "Do this now"}
          />
          <button
            className="todo-edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditStart(todo);
            }}
            aria-label="Edit"
          >
            &#9998;
          </button>
          <button
            className="todo-delete"
            onClick={() => handleDelete(todo.id)}
            aria-label="Delete"
          >
            &times;
          </button>
        </div>
      ))}

      {/* Add new item */}
      <form onSubmit={handleAdd} className="ruled-line" style={{ paddingLeft: "3.2rem" }}>
        <input
          ref={inputRef}
          className="add-input"
          placeholder="Add a new item..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
      </form>

      {/* Extra ruled lines for the paper look */}
      {Array.from({ length: Math.max(0, 12 - todos.length) }).map((_, i) => (
        <div key={`rule-${i}`} className="ruled-line" />
      ))}
    </div>
  );
}
