"use client";

import { useEffect, useState } from "react";
import {
  getInterviewState,
  getCandidateData,
  type Question,
  type CandidateData,
} from "@/lib/indexedDB";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Target,
  User,
  Mail,
  Phone,
  Award,
} from "lucide-react";

interface Report {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionAnalysis: Array<{
    questionNumber: number;
    difficulty: string;
    score: number;
    feedback: string;
    timeSpent: number;
    strengths: string[];
    improvements: string[];
  }>;
  finalRecommendation: "HIRE" | "MAYBE" | "NO_HIRE";
  nextSteps: string[];
}

export default function ResultsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadResults = async () => {
      try {
        const state = await getInterviewState();
        const candidate = await getCandidateData();

        if (!state || !candidate) {
          router.push("/candidate");
          return;
        }

        setQuestions(state.questions);
        setCandidateData(candidate);

        // Generate final report
        const response = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: state.questions,
            candidateData: candidate,
          }),
        });

        if (response.ok) {
          const reportData = await response.json();
          setReport(reportData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading results:", error);
        setIsLoading(false);
      }
    };

    loadResults();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const averageScore =
    questions.length > 0
      ? Math.round(
          questions.reduce((sum, q) => sum + (q.score || 0), 0) /
            questions.length
        )
      : 0;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "HIRE":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "MAYBE":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      case "NO_HIRE":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "HARD":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interview Results
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Comprehensive evaluation report
          </p>
        </div>

        {/* Candidate Info */}
        {candidateData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{candidateData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{candidateData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{candidateData.phone}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Skills:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidateData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {averageScore}%
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Overall Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Target className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {questions.filter((q) => q.answer).length}/{questions.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Questions Answered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {Math.round(
                  questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / 60
                )}
                m
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Total Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Final Recommendation */}
        {report && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Final Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge
                    className={`text-lg px-4 py-2 ${getRecommendationColor(
                      report.finalRecommendation
                    )}`}
                  >
                    {report.finalRecommendation}
                  </Badge>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {report.summary}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {report.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strengths and Weaknesses */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {weakness}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <Badge
                          className={getDifficultyColor(question.difficulty)}
                        >
                          {question.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {question.timeSpent || 0}s
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {question.score || 0}%
                      </div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>

                  {question.answer && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Your Answer:
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {question.answer}
                      </p>
                    </div>
                  )}

                  {question.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Feedback:
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        {question.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {report && report.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {report && report.nextSteps.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push("/candidate")}
            variant="outline"
            size="lg"
          >
            Back to Lobby
          </Button>
          <Button onClick={() => window.print()} size="lg">
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
