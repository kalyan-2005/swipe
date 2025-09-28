"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Send,
  Pause,
  Play,
  RotateCcw,
  CheckCircle,
  Maximize2,
  Minimize2,
  Menu,
  X,
  Target,
  Timer,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
}

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    question: "Can you tell me about yourself and your experience with React?",
    difficulty: "EASY",
  },
  {
    id: "2",
    question:
      "What are the key differences between useState and useEffect hooks?",
    difficulty: "EASY",
  },
  {
    id: "3",
    question:
      "How would you optimize a React application that is experiencing performance issues?",
    difficulty: "MEDIUM",
  },
  {
    id: "4",
    question:
      "Explain the concept of closures in JavaScript and provide a practical example.",
    difficulty: "MEDIUM",
  },
  {
    id: "5",
    question:
      "Design a scalable architecture for a real-time chat application with millions of users.",
    difficulty: "HARD",
  },
  {
    id: "6",
    question:
      "How would you implement a custom hook for managing complex state with undo/redo functionality?",
    difficulty: "HARD",
  },
];

export default function InterviewPage() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const data = localStorage.getItem("candidateData");
    if (data) {
      setCandidateData(JSON.parse(data));
    } else {
      router.push("/candidate");
    }
    setIsLoading(false);
  }, [router]);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowFullscreenPrompt(false);
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
    }
  };

  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !isInterviewComplete) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isPaused, isInterviewComplete]);

  useEffect(() => {
    if (timeLeft === 0 && !isInterviewComplete) {
      handleSubmitAnswer();
    }
  }, [timeLeft, isInterviewComplete]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() && timeLeft > 0) return;

    setIsSubmitting(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock scoring and feedback
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    const feedback = getMockFeedback(currentQuestion.difficulty, score);

    // Update the current question with answer and score
    const updatedQuestions = questions.map((q, index) =>
      index === currentQuestionIndex
        ? {
            ...q,
            answer: currentAnswer,
            score,
            feedback,
            timeSpent: 20 - timeLeft,
          }
        : q
    );

    setQuestions(updatedQuestions);

    // Move to next question or complete interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
      setTimeLeft(20);
    } else {
      setIsInterviewComplete(true);
      // Store completed interview data
      localStorage.setItem(
        "completedInterview",
        JSON.stringify(updatedQuestions)
      );
    }

    setIsSubmitting(false);
  };

  const getMockFeedback = (difficulty: string, score: number): string => {
    if (score >= 90) {
      return `Excellent answer! You demonstrated strong understanding of ${difficulty.toLowerCase()} concepts.`;
    } else if (score >= 80) {
      return `Good response! You covered the main points well. Consider adding more specific examples.`;
    } else if (score >= 70) {
      return `Decent answer. You're on the right track but could benefit from more depth and detail.`;
    } else {
      return `This area needs improvement. Consider reviewing the fundamentals and practicing more.`;
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return "text-red-500";
    if (timeLeft <= 10) return "text-yellow-500";
    return "text-green-500";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No candidate data found. Please start over.
            </p>
            <Button onClick={() => router.push("/candidate")}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fullscreen prompt
  if (showFullscreenPrompt && !isFullscreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Maximize2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Fullscreen Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              For the best interview experience, please enter fullscreen mode.
              This helps you focus on the questions without distractions.
            </p>
            <Button onClick={enterFullscreen} size="lg" className="w-full">
              <Maximize2 className="h-5 w-5 mr-2" />
              Enter Fullscreen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Interview Complete!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Great job, {candidateData.name}! Your interview has been
              completed.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push("/candidate/results")}
                size="lg"
                className="px-8 py-6"
              >
                View Results
              </Button>
              <Button
                onClick={exitFullscreen}
                variant="outline"
                size="lg"
                className="px-8 py-6"
              >
                <Minimize2 className="h-5 w-5 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 0 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Progress
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Candidate Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {candidateData.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {candidateData.email}
            </p>
          </div>

          {/* Timer */}
          <Card className="mb-6">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Time Remaining
                </span>
              </div>
              <div className={`text-3xl font-bold ${getTimerColor()}`}>
                {timeLeft}s
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5
                      ? "bg-red-500"
                      : timeLeft <= 10
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${(timeLeft / 20) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Questions ({currentQuestionIndex + 1}/{questions.length})
            </h4>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  index === currentQuestionIndex
                    ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                    : question.answer
                    ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentQuestionIndex
                        ? "bg-green-500 text-white"
                        : index === currentQuestionIndex
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {index < currentQuestionIndex ? "✓" : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Question {index + 1}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`text-xs ${
                          question.difficulty === "EASY"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : question.difficulty === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {question.difficulty}
                      </Badge>
                      {question.score && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {question.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${
                      currentQuestion.difficulty === "EASY"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : currentQuestion.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {candidateData.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className={`text-2xl font-bold ${getTimerColor()}`}>
                  {timeLeft}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={isSubmitting}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={exitFullscreen}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-8 h-full flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-6">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[300px] resize-none text-lg"
                    disabled={isSubmitting || isPaused}
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentAnswer.length} characters
                      </p>
                      {timeLeft <= 10 && timeLeft > 0 && (
                        <div className="flex items-center gap-1 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Time running out!</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={
                        !currentAnswer.trim() || isSubmitting || timeLeft === 0
                      }
                      size="lg"
                      className="px-8"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
