import { getTodos } from "./actions/todo-actions";
import { getTracker } from "./actions/tracker-actions";
import { TodoList } from "./todo-list";
import { DailyTracker } from "./daily-tracker";

export default async function Page() {
  const [items, tracker] = await Promise.all([getTodos(), getTracker()]);

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
        <DailyTracker
          initial={{
            waterCount: tracker.waterCount,
            fruitCount: tracker.fruitCount,
          }}
        />
        <div className="coffee-ring" aria-hidden="true" />
      </div>
    </main>
  );
}
