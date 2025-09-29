import { NextResponse } from "next/server";
import { getInterviewState } from "@/lib/indexedDB";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const questionId = url.searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required." },
        { status: 400 }
      );
    }

    const state = await getInterviewState();
    const question = state?.questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    if (!question.rawSolution) {
      return NextResponse.json(
        { error: "Solution not available for this question." },
        { status: 404 }
      );
    }

    return NextResponse.json({ solution: question.rawSolution });
  } catch (error) {
    console.error("Error fetching solution:", error);
    return NextResponse.json(
      { error: "Failed to fetch solution." },
      { status: 500 }
    );
  }
}
