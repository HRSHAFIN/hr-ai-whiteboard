"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";

export async function createWhiteboard(formData: FormData) {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const name = String(formData.get("name") ?? "").trim();

  const [board] = await db
    .insert(whiteboards)
    .values({ title: name || "Untitled Whiteboard", ownerId: user.id })
    .returning();

  revalidatePath("/dashboard");
  redirect(`/workspace/${board.id}`);
}

export async function archiveWhiteboard(id: number) {
  const user = await getDbUser();
  if (!user) return;

  await db
    .update(whiteboards)
    .set({ archivedAt: new Date() })
    .where(and(eq(whiteboards.id, id), eq(whiteboards.ownerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/archive");
}

export async function restoreWhiteboard(id: number) {
  const user = await getDbUser();
  if (!user) return;

  await db
    .update(whiteboards)
    .set({ archivedAt: null })
    .where(and(eq(whiteboards.id, id), eq(whiteboards.ownerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/archive");
}

export async function deleteWhiteboard(id: number) {
  const user = await getDbUser();
  if (!user) return;

  await db
    .delete(whiteboards)
    .where(and(eq(whiteboards.id, id), eq(whiteboards.ownerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/archive");
}
