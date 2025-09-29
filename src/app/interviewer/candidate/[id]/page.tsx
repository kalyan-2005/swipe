"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Star,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answer: string;
  score: number;
  feedback: string;
  timeSpent: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  interviewCount: number;
  averageScore: number;
  lastInterview: string;
  status: "completed" | "in-progress" | "not-started";
  questions: Question[];
}

// eslint-disable-next-line @next/next/no-async-client-component
export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/interview?interviewId=${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const transformedCandidate: Candidate = {
          id: data.candidate.id,
          name: data.candidate.name,
          email: data.candidate.email,
          phone: data.candidate.phone,
          skills: data.candidate.skills || [],
          interviewCount: 1,
          averageScore: data.score,
          lastInterview: data.completedAt,
          status: data.status === "COMPLETED" ? "completed" : "in-progress", // Map status from API to frontend interface
          questions: data.questions.map((q: Question) => ({
            id: q.id,
            question: q.question,
            difficulty: q.difficulty,
            answer: q.answer,
            score: q.score,
            feedback: q.feedback,
            timeSpent: q.timeSpent,
          })),
        };
        setCandidate(transformedCandidate);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
        setCandidate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Candidate not found.
            </p>
            <Button onClick={() => router.push("/interviewer")}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalTimeSpent = candidate.questions.reduce(
    (sum, q) => sum + q.timeSpent,
    0
  );
  const averageTimePerQuestion = Math.round(
    totalTimeSpent / candidate.questions.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl max-sm:text-sm font-bold text-gray-900 dark:text-white">
                Candidate Details
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/interviewer")}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 max-sm:hidden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {candidate.name}
            </h1>
            <div className="flex max-sm:flex-wrap max-sm:text-xs items-center gap-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {candidate.email}
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last interview: {formatDate(candidate.lastInterview)}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Candidate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Interviews Completed:
                    </span>
                    <span className="font-medium">
                      {candidate.interviewCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      candidate.averageScore
                    )} mb-2`}
                  >
                    {candidate.averageScore}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Average Score
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Time:
                    </span>
                    <span className="font-medium">
                      {Math.round(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Avg per Question:
                    </span>
                    <span className="font-medium">
                      {averageTimePerQuestion}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["EASY", "MEDIUM", "HARD"].map((difficulty) => {
                    const difficultyQuestions = candidate.questions.filter(
                      (q) => q.difficulty === difficulty
                    );
                    const avgScore =
                      difficultyQuestions.length > 0
                        ? Math.round(
                            difficultyQuestions.reduce(
                              (sum, q) => sum + q.score,
                              0
                            ) / difficultyQuestions.length
                          )
                        : 0;

                    return (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {difficulty} Questions
                          </span>
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              avgScore
                            )}`}
                          >
                            {avgScore}%
                          </span>
                        </div>
                        <Progress value={avgScore} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Question Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of each question and answer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="sm:space-y-6">
                {candidate.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="sm:border border-gray-200 dark:border-gray-700 rounded-lg sm:p-6"
                  >
                    <div className="flex flex-col mb-4">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Question {index + 1}
                          </span>
                          <Badge
                            className={getDifficultyColor(question.difficulty)}
                          >
                            {question.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {question.timeSpent}s
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`sm:text-2xl font-bold ${getScoreColor(
                              question.score
                            )}`}
                          >
                            {question.score}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Score
                          </div>
                        </div>
                      </div>
                      <h3 className="max-sm:text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {question.question}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Candidate&apos;s Answer:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          {question.answer}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          AI Feedback:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                          {question.feedback}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
