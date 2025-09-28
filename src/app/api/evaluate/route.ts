// app/api/evaluate/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Get the question and answer from the request body
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required.' },
        { status: 400 }
      );
    }

    // 2. Select the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 3. Craft a detailed prompt for the AI
    const prompt = `
      You are an expert technical interview evaluator.
      Your task is to assess the user's answer to a given question.
      Provide constructive feedback, point out any inaccuracies, and suggest improvements.
      Evaluate the answer based on correctness, clarity, and completeness.

      Here is the interview question:
      "${question}"

      Here is the user's answer:
      "${answer}"

      Please provide your evaluation now:
    `;

    // 4. Send the prompt to the model and get the response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const feedback = response.text();

    // 5. Return the feedback
    return NextResponse.json({ feedback });

  } catch (err) {
    console.error('Error in Gemini API call:', err);
    return NextResponse.json(
      { error: 'Failed to get evaluation from AI.' },
      { status: 500 }
    );
  }
}