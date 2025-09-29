import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Question } from "@prisma/client";
import { clearAllData } from "@/lib/indexedDB";

export async function POST(req: Request) {
  try {
    const { questions, candidateData, score } = await req.json();

    if (!questions || !candidateData) {
      return NextResponse.json(
        { error: "Missing required data for interview submission." },
        { status: 400 }
      );
    }
    const candidate = await prisma.candidate.create({
      data: {
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
      },
    });
    // Always create a new interview for a completed submission
    const interview = await prisma.interview.create({
      data: {
        candidateId: candidate.id,
        status: "COMPLETED",
        score: score,
        completedAt: new Date(),
        questions: {
          create: questions.map((q: Question) => ({
            questionNumber: q.questionNumber,
            difficulty: q.difficulty,
            question: q.question,
            answer: q.answer,
            score: q.score,
            feedback: q.feedback,
            timeSpent: q.timeSpent,
          })),
        },
      },
    });
    await clearAllData();
    localStorage.setItem("email", candidateData.email);

    return NextResponse.json({
      message: "Interview data saved successfully!",
      interviewId: interview.id,
    });
  } catch (error) {
    console.error("Error saving interview data:", error);
    return NextResponse.json(
      { error: "Failed to save interview data." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required." },
        { status: 400 }
      );
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        candidate: true,
        questions: {
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview data:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview data." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
