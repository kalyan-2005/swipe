import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const candidates = await prisma.interview.findMany({
    include: {
      candidate: true,
      questions: true,
    },
  });
  return NextResponse.json(candidates);
}
