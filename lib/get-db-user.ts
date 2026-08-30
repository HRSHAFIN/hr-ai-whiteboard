import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db, users } from "@/db";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  return user ?? null;
}
