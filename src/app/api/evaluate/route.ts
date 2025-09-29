import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required." },
        { status: 400 }
      );
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert technical interview evaluator.
      Your task is to assess the user's answer to a given question.
      Provide constructive feedback, point out any inaccuracies, and suggest improvements.
      Evaluate the answer based on correctness, clarity, and completeness.

      Here is the interview question:
      "${question}"

      Here is the user's answer:
      "${answer}"

      Evaluate the answer and provide ONLY a valid JSON response in this exact format:
      { "score": 85, "feedback": "Your answer demonstrates good understanding of the concept. You covered the main points well, but could benefit from more specific examples and deeper technical details." }
      
      Score should be between 0-100. Feedback should be constructive and specific and not too long(maximum of 5-6 lines).
    `;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      const evaluation = JSON.parse(jsonString);
      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return NextResponse.json({
        score: 70,
        feedback:
          "Your answer shows understanding of the topic. Consider providing more specific examples and technical details to improve your response.",
      });
    }
  } catch (err) {
    console.error("Error in Gemini API call:", err);
    return NextResponse.json(
      { error: "Failed to get evaluation from AI." },
      { status: 500 }
    );
  }
}
