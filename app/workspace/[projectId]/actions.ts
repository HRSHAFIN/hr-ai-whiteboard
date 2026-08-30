"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";
import type { WhiteboardData } from "@/lib/whiteboard-types";

export async function saveWhiteboardData(id: number, data: WhiteboardData) {
  const user = await getDbUser();
  if (!user) return;

  await db
    .update(whiteboards)
    .set({ data, updatedAt: new Date() })
    .where(and(eq(whiteboards.id, id), eq(whiteboards.ownerId, user.id)));

  revalidatePath(`/workspace/${id}`);
  revalidatePath("/dashboard");
}

export async function renameWhiteboard(id: number, title: string) {
  const user = await getDbUser();
  if (!user) return;

  const trimmed = title.trim();
  if (!trimmed) return;

  await db
    .update(whiteboards)
    .set({ title: trimmed, updatedAt: new Date() })
    .where(and(eq(whiteboards.id, id), eq(whiteboards.ownerId, user.id)));

  revalidatePath(`/workspace/${id}`);
  revalidatePath("/dashboard");
}
