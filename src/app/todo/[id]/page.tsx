import { notFound } from "next/navigation";
import { getTodo } from "@/app/actions/todo-actions";
import { getSubtasks } from "@/app/actions/subtask-actions";
import { SubtaskList } from "./subtask-list";
import { NoteEditor } from "./note-editor";
import Link from "next/link";

export default async function TodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const todoId = parseInt(id, 10);
  const [todo, subtasks] = await Promise.all([
    getTodo(todoId),
    getSubtasks(todoId),
  ]);

  if (!todo) notFound();

  const created = todo.createdAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main>
      <div className="paper detail-paper">
        <Link href="/" className="back-link" aria-label="Back to list">
          &larr; back to list
        </Link>

        <div className="detail-header">
          <div className="detail-status">
            <span
              className={`todo-check ${todo.completed ? "checked" : ""}`}
              style={{ pointerEvents: "none" }}
            />
            <span className="detail-label">
              {todo.completed ? "Completed" : todo.doNow ? "Doing now" : "In progress"}
            </span>
          </div>
          <h1 className="detail-title">{todo.text}</h1>
          <p className="paper-date">{created}</p>
        </div>

        <div className="detail-divider" />

        <SubtaskList todoId={todo.id} initialSubtasks={subtasks} />

        <div className="detail-divider" />

        <div className="notes-section">
          <h2 className="notes-heading">Notes</h2>
          <NoteEditor todoId={todo.id} initialNotes={todo.notes} />
        </div>

        <div className="coffee-ring detail-coffee" aria-hidden="true" />
      </div>
    </main>
  );
}
