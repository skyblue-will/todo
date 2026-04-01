import { getTodos } from "./actions/todo-actions";
import { TodoList } from "./todo-list";

export default async function Page() {
  const items = await getTodos();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main>
      <div className="paper">
        <h1 className="paper-title">To Do</h1>
        <p className="paper-date">{today}</p>
        <TodoList initialTodos={items} />
        <div className="coffee-ring" aria-hidden="true" />
      </div>
    </main>
  );
}
