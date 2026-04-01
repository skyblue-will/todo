"use server";

import { getDb } from "@/db";
import { dailyTrackers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTracker() {
  const db = getDb();
  const today = todayStr();
  const [row] = await db
    .select()
    .from(dailyTrackers)
    .where(eq(dailyTrackers.date, today));

  if (row) return row;

  // Create today's row
  const [created] = await db
    .insert(dailyTrackers)
    .values({ date: today, waterCount: 0, fruitCount: 0 })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Race condition fallback
  const [existing] = await db
    .select()
    .from(dailyTrackers)
    .where(eq(dailyTrackers.date, today));
  return existing;
}

export async function setWaterCount(count: number) {
  const db = getDb();
  const today = todayStr();
  const clamped = Math.max(0, Math.min(6, count));
  await db
    .update(dailyTrackers)
    .set({ waterCount: clamped })
    .where(eq(dailyTrackers.date, today));
  revalidatePath("/");
}

export async function setFruitCount(count: number) {
  const db = getDb();
  const today = todayStr();
  const clamped = Math.max(0, Math.min(7, count));
  await db
    .update(dailyTrackers)
    .set({ fruitCount: clamped })
    .where(eq(dailyTrackers.date, today));
  revalidatePath("/");
}
