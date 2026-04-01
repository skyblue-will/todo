"use server";

import { getDb } from "@/db";
import { todos } from "@/db/schema";
import { eq, asc, gt, lt, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  const db = getDb();
  return db.select().from(todos).orderBy(asc(todos.position));
}

export async function addTodo(text: string) {
  const db = getDb();
  const existing = await db.select().from(todos).orderBy(asc(todos.position));
  const nextPosition = existing.length > 0 ? Math.max(...existing.map((t) => t.position)) + 1 : 0;
  await db.insert(todos).values({ text, position: nextPosition });
  revalidatePath("/");
}

export async function toggleTodo(id: number) {
  const db = getDb();
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  if (todo) {
    const nowCompleted = !todo.completed;
    await db
      .update(todos)
      .set({
        completed: nowCompleted,
        // Auto-clear "do now" when completing
        ...(nowCompleted && todo.doNow ? { doNow: false } : {}),
      })
      .where(eq(todos.id, id));
  }
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  const db = getDb();
  await db.delete(todos).where(eq(todos.id, id));
  revalidatePath("/");
}

export async function updateTodoText(id: number, text: string) {
  const db = getDb();
  await db.update(todos).set({ text }).where(eq(todos.id, id));
  revalidatePath("/");
}

export async function reorderTodos(orderedIds: number[]) {
  const db = getDb();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(todos).set({ position: index }).where(eq(todos.id, id))
    )
  );
  revalidatePath("/");
}

export async function getTodo(id: number) {
  const db = getDb();
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  return todo ?? null;
}

export async function toggleDoNow(id: number) {
  const db = getDb();
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  if (todo) {
    await db.update(todos).set({ doNow: !todo.doNow }).where(eq(todos.id, id));
  }
  revalidatePath("/");
}

export async function updateTodoNotes(id: number, notes: string) {
  const db = getDb();
  await db.update(todos).set({ notes }).where(eq(todos.id, id));
  revalidatePath(`/todo/${id}`);
}
