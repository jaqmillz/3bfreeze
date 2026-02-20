import { NextResponse } from "next/server";
import { getBreachByCode } from "@/lib/breach-codes";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length > 50) {
      return NextResponse.json(null, { status: 400 });
    }

    const breach = await getBreachByCode(code);
    if (!breach) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      code: breach.code,
      name: breach.name,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
