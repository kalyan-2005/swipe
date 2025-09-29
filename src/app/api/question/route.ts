import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { skills, difficulty, questionCount } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const skillsText = skills
      ? `focused on: ${skills.join(", ")}`
      : "general frontend development";
    const difficultyText = difficulty
      ? `with ${difficulty} difficulty`
      : "with varying difficulty levels";
    const count = questionCount || 1;

    const prompt = `
      Generate ${count} technical interview question${
      count > 1 ? "s" : ""
    } for a frontend developer ${skillsText} ${difficultyText}.
      
      For each question, provide a JSON response in this exact format:
      {
        "question": "The actual interview question text",
        "difficulty": "EASY|MEDIUM|HARD",
        "solution": "A detailed, concise, and effective solution/explanation for the question"
      }
      
      ${
        count > 1
          ? "Return an array of question objects."
          : "Return a single question object."
      }
      
      Make sure the questions are practical, relevant, and test real-world full-stack (React/Node.js) development skills.
      Include questions about React, Node.js, JavaScript, CSS, HTML, state management, performance, testing, and modern web development practices.
      Ensure questions can be answered within the specified time limits: Easy (20s), Medium (60s), Hard (120s).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      const questions = JSON.parse(jsonString);
      return NextResponse.json(questions);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback question if JSON parsing fails
      return NextResponse.json({
        question:
          "Explain the difference between controlled and uncontrolled components in React, and provide an example of each.",
        difficulty: "MEDIUM",
        solution:
          "Controlled components: Form elements whose values are controlled by React state. Example: An input field with its value tied to `useState`. Uncontrolled components: Form elements whose values are managed by the DOM itself. Example: An input field using a `useRef` to get its value.",
      });
    }
  } catch (err) {
    console.error("Error generating question:", err);
    return NextResponse.json(
      { error: "Failed to generate question." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Generate ONE technical interview question for a full-stack developer (React/Node.js).
      Provide JSON: { "question": "...", "difficulty": "EASY|MEDIUM|HARD", "solution": "..." }.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      const question = JSON.parse(jsonString);
      return NextResponse.json(question);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return NextResponse.json({
        question:
          "Explain the difference between controlled and uncontrolled components in React, and provide an example of each.",
        difficulty: "MEDIUM",
        solution:
          "Controlled components: Form elements whose values are controlled by React state. Example: An input field with its value tied to `useState`. Uncontrolled components: Form elements whose values are managed by the DOM itself. Example: An input field using a `useRef` to get its value.",
      });
    }
  } catch (err) {
    console.error("Error generating question:", err);
    return NextResponse.json(
      { error: "Failed to generate question." },
      { status: 500 }
    );
  }
}
