import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";

// GET /api/whiteboards?archived=true
// Returns the signed-in user's whiteboards (non-archived by default).
export async function GET(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const archived = req.nextUrl.searchParams.get("archived") === "true";

  const boards = await db.query.whiteboards.findMany({
    where: and(
      eq(whiteboards.ownerId, user.id),
      archived ? isNotNull(whiteboards.archivedAt) : isNull(whiteboards.archivedAt)
    ),
    orderBy: desc(whiteboards.updatedAt),
  });

  return NextResponse.json(boards);
}
