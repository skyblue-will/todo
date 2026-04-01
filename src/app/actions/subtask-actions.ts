"use server";

import { getDb } from "@/db";
import { subtasks } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSubtasks(todoId: number) {
  const db = getDb();
  return db
    .select()
    .from(subtasks)
    .where(eq(subtasks.todoId, todoId))
    .orderBy(asc(subtasks.position));
}

export async function addSubtask(todoId: number, text: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(subtasks)
    .where(eq(subtasks.todoId, todoId));
  const nextPos =
    existing.length > 0
      ? Math.max(...existing.map((s) => s.position)) + 1
      : 0;
  await db.insert(subtasks).values({ todoId, text, position: nextPos });
  revalidatePath(`/todo/${todoId}`);
}

export async function toggleSubtask(id: number, todoId: number) {
  const db = getDb();
  const [sub] = await db.select().from(subtasks).where(eq(subtasks.id, id));
  if (sub) {
    await db
      .update(subtasks)
      .set({ completed: !sub.completed })
      .where(eq(subtasks.id, id));
  }
  revalidatePath(`/todo/${todoId}`);
}

export async function deleteSubtask(id: number, todoId: number) {
  const db = getDb();
  await db.delete(subtasks).where(eq(subtasks.id, id));
  revalidatePath(`/todo/${todoId}`);
}

export async function updateSubtaskText(
  id: number,
  text: string,
  todoId: number
) {
  const db = getDb();
  await db.update(subtasks).set({ text }).where(eq(subtasks.id, id));
  revalidatePath(`/todo/${todoId}`);
}
