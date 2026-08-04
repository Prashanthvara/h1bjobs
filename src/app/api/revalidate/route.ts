import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { extractSecret } from "@/lib/revalidateSecret";
import { REVALIDATE_PATHS } from "@/lib/revalidatePaths";

export async function POST(request: NextRequest) {
    const secret = extractSecret(request.headers, request.nextUrl.searchParams.get("secret"));
    const expected = process.env.REVALIDATE_SECRET;

    // Explicit !expected guard makes the fail-closed behaviour obvious rather
    // than incidental if REVALIDATE_SECRET is ever unset in the environment.
    if (!expected || !secret || secret !== expected) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    REVALIDATE_PATHS.forEach((path) => revalidatePath(path));

    return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
