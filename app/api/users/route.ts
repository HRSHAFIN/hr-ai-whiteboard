import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";

// GET /api/users
// Ensures the currently signed-in Clerk user has a matching row in the
// Neon `users` table. Called by Provider right after sign-in so every
// Clerk account gets synced into our own database automatically.
export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "Signed-in user has no email address" },
      { status: 400 }
    );
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (existingUser) {
    return NextResponse.json(existingUser);
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: user.id,
      name: fullName || null,
      email,
    })
    .returning();

  return NextResponse.json(newUser, { status: 201 });
}
