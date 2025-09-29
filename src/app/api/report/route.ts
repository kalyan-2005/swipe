import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { questions, candidateData } = await req.json();

    if (!questions || !candidateData) {
      return NextResponse.json(
        { error: "Questions and candidate data are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Calculate overall statistics
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(
      (q) => q.answer && q.answer.trim().length > 0
    );
    const averageScore =
      answeredQuestions.length > 0
        ? Math.round(
            answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) /
              answeredQuestions.length
          )
        : 0;

    const prompt = `
      You are an expert technical interviewer creating a comprehensive evaluation report.
      
      Candidate Information:
      - Name: ${candidateData.name}
      - Email: ${candidateData.email}
      - Skills: ${candidateData.skills.join(", ")}

      Interview Results:
      - Total Questions: ${totalQuestions}
      - Questions Answered: ${answeredQuestions.length}
      - Average Score: ${averageScore}%

      Detailed Question Analysis:
      ${questions
        .map(
          (q, index) => `
        Question ${index + 1} (${q.difficulty}):
        Question: ${q.question}
        Answer: ${q.answer || "No answer provided"}
        Score: ${q.score || 0}%
        Feedback: ${q.feedback || "No feedback available"}
        Time Spent: ${q.timeSpent || 0} seconds
      `
        )
        .join("\n")}

      Please provide a comprehensive evaluation report in JSON format with the following structure:
      {
        "overallScore": number (0-100),
        "summary": "Brief overall assessment",
        "strengths": ["List of key strengths"],
        "weaknesses": ["List of areas for improvement"],
        "recommendations": ["Specific recommendations for improvement"],
        "questionAnalysis": [
          {
            "questionNumber": number,
            "difficulty": "EASY|MEDIUM|HARD",
            "score": number,
            "feedback": "string",
            "timeSpent": number,
            "strengths": ["string"],
            "improvements": ["string"]
          }
        ],
        "finalRecommendation": "HIRE|MAYBE|NO_HIRE",
        "nextSteps": ["Recommended next steps for the candidate"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const report = JSON.parse(text);
      return NextResponse.json(report);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback report if JSON parsing fails
      return NextResponse.json({
        overallScore: averageScore,
        summary: `The candidate scored ${averageScore}% overall with ${answeredQuestions.length} out of ${totalQuestions} questions answered.`,
        strengths: [
          "Demonstrated technical knowledge",
          "Provided structured answers",
        ],
        weaknesses: [
          "Could improve on specific examples",
          "Some answers lacked depth",
        ],
        recommendations: [
          "Practice with more complex scenarios",
          "Focus on practical examples",
        ],
        questionAnalysis: questions.map((q, index) => ({
          questionNumber: index + 1,
          difficulty: q.difficulty,
          score: q.score || 0,
          feedback: q.feedback || "No feedback available",
          timeSpent: q.timeSpent || 0,
          strengths: ["Answered the question"],
          improvements: ["Could provide more detail"],
        })),
        finalRecommendation:
          averageScore >= 80
            ? "HIRE"
            : averageScore >= 60
            ? "MAYBE"
            : "NO_HIRE",
        nextSteps: [
          "Review technical fundamentals",
          "Practice coding problems",
        ],
      });
    }
  } catch (err) {
    console.error("Error generating report:", err);
    return NextResponse.json(
      { error: "Failed to generate evaluation report." },
      { status: 500 }
    );
  }
}
