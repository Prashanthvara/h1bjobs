import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get("secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    revalidatePath("/");

    return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
