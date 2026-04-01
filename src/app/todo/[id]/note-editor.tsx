"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { updateTodoNotes } from "@/app/actions/todo-actions";

export function NoteEditor({
  todoId,
  initialNotes,
}: {
  todoId: number;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (value: string) => {
      setSaved(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        startTransition(async () => {
          await updateTodoNotes(todoId, value);
          setSaved(true);
        });
      }, 600);
    },
    [todoId]
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setNotes(value);
    save(value);
  }

  return (
    <div className="notes-editor-wrap">
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={handleChange}
        placeholder="Write your notes here..."
        rows={12}
      />
      <span className="save-indicator">
        {isPending ? "saving..." : saved ? "" : "typing..."}
      </span>
    </div>
  );
}
