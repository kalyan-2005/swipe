"use client";

import { useEffect, useState } from "react";
import { getAllQuestions } from "@/lib/indexedDB";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SummaryPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
    };
    load();
  }, []);

  const totalScore = questions.reduce((acc, q) => acc + (q.score || 0), 0);
  const averageScore = (totalScore / questions.length).toFixed(2);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-4">Interview Summary</h1>
      <p className="mb-4 font-semibold">Average Score: {averageScore}%</p>

      {questions.map(q => (
        <div key={q.id} className="mb-6 p-4 border rounded bg-white dark:bg-gray-800">
          <h2 className="font-bold mb-2">Q: {q.text}</h2>
          <p className="mb-2"><strong>Your Answer:</strong> {q.userAnswer || "No Answer"}</p>
          <p className="mb-2"><strong>Feedback:</strong> {q.feedback}</p>
          <p><strong>Score:</strong> {q.score}%</p>
        </div>
      ))}

      <Button onClick={() => router.push("/candidate")}>Back to Lobby</Button>
    </div>
  );
}
