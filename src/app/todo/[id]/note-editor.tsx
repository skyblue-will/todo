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
  const [status, setStatus] = useState<"idle" | "typing" | "saving" | "saved">("idle");
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (value: string) => {
      setStatus("typing");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      timeoutRef.current = setTimeout(() => {
        setStatus("saving");
        startTransition(async () => {
          await updateTodoNotes(todoId, value);
          setStatus("saved");
          fadeRef.current = setTimeout(() => setStatus("idle"), 2000);
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
      <span className={`save-indicator ${status}`}>
        {status === "typing" && "writing..."}
        {status === "saving" && "saving..."}
        {status === "saved" && "\u2713 saved"}
      </span>
    </div>
  );
}
