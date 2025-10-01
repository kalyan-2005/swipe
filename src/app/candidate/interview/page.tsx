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
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getInterviewState,
  saveInterviewState,
  getCandidateData,
  saveCandidateData,
  type Question,
  type InterviewState,
  type CandidateData,
} from "@/lib/indexedDB";
import { Skeleton } from "@/components/ui/skeleton";

const TOTAL_QUESTIONS = 6;

export default function InterviewPage() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  // Initialize questions as an array of placeholders
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
      id: `q_placeholder_${i}`,
      question: `Question ${i + 1}`,
      difficulty: i < 2 ? "EASY" : i < 4 ? "MEDIUM" : "HARD",
      timeSpent: 0,
    }))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(20); // Initialized with a default, will be updated
  const [isPaused, setIsPaused] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [showNextButton, setShowNextButton] = useState(false);
  const [loader, setLoader] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  // Initialize interview state
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Load candidate data from IndexedDB
        const candidate = await getCandidateData();
        if (!candidate) {
          router.push("/candidate");
          return;
        }
        setCandidateData(candidate);

        // Load interview state from IndexedDB
        let state = await getInterviewState();

        if (!state) {
          // Create new interview state with placeholder questions
          const initialQuestions: Question[] = Array.from(
            { length: TOTAL_QUESTIONS },
            (_, i) => ({
              id: `q_placeholder_${i}`,
              question: `Question ${i + 1}`,
              difficulty: i < 2 ? "EASY" : i < 4 ? "MEDIUM" : "HARD",
              timeSpent: 0,
            })
          );
          state = {
            id: `interview_${Date.now()}`,
            questions: initialQuestions,
            currentIndex: 0,
            timerEndsAt: 0,
            isPaused: false,
            isComplete: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveInterviewState(state);
        } else {
          // Ensure questions array always has TOTAL_QUESTIONS length
          if (state.questions.length < TOTAL_QUESTIONS) {
            for (let i = state.questions.length; i < TOTAL_QUESTIONS; i++) {
              state.questions.push({
                id: `q_placeholder_${i}`,
                question: `Question ${i + 1}`,
                difficulty: i < 2 ? "EASY" : i < 4 ? "MEDIUM" : "HARD",
                timeSpent: 0,
              });
            }
            await saveInterviewState(state);
          }
        }

        // Load questions and current state
        setQuestions(state.questions);
        setCurrentQuestionIndex(state.currentIndex);
        setIsPaused(state.isPaused);
        setIsInterviewComplete(state.isComplete);

        // Calculate time left
        const currentQ = state.questions[state.currentIndex];
        if (state.timerEndsAt > 0 && !state.isPaused && !state.isComplete) {
          const remaining = Math.max(
            0,
            Math.ceil((state.timerEndsAt - Date.now()) / 1000)
          );
          setTimeLeft(remaining);
        } else if (currentQ && currentQ.answer && state.timerEndsAt === 0) {
          // If question is already answered, set timeLeft to its timeSpent
          setTimeLeft(
            getTimeLimitForDifficulty(currentQ.difficulty) -
              (currentQ.timeSpent || 0)
          );
          setShowNextButton(true);
        } else if (currentQ && !currentQ.answer && state.timerEndsAt === 0) {
          // If question is not answered and timer wasn't started, set to full time
          setTimeLeft(getTimeLimitForDifficulty(currentQ.difficulty));
        } else if (
          state.timerEndsAt > 0 &&
          state.timerEndsAt < Date.now() &&
          currentQ &&
          !currentQ.answer
        ) {
          const updatedQuestions = state.questions.map((q, index) =>
            index === state.currentIndex
              ? {
                  ...q,
                  answer: "",
                  score: 0,
                  feedback:
                    "Time up! No answer submitted. Automatically advanced.",
                  timeSpent: getTimeLimitForDifficulty(currentQ.difficulty), // Full time spent
                  submittedAt: Date.now(),
                  rawSolution: "",
                }
              : q
          );
          state.questions = updatedQuestions;
          state.isPaused = true; // Stop timer for this question
          await saveInterviewState(state);
          setQuestions(updatedQuestions);
          setIsPaused(true);
          setShowNextButton(true);
          // Do not immediately move to the next question here, as it will be handled by the next button click.
        }
        // Generate the current question if it's a placeholder
        if (currentQ && currentQ.id.startsWith("q_placeholder")) {
          await generateQuestion(state.currentIndex);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing interview:", error);
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [router]);

  // Generate a new question
  const generateQuestion = async (
    indexToUpdate: number = currentQuestionIndex
  ) => {
    try {
      setLoader(true);
      const response = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: candidateData?.skills || [],
          difficulty: questions[indexToUpdate].difficulty, // Use difficulty from placeholder
        }),
      });

      if (!response.ok) throw new Error("Failed to generate question");

      const questionData = await response.json();
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        question: questionData.question,
        difficulty: questionData.difficulty,
        rawSolution: questionData.solution, // Store the solution as rawSolution
        timeSpent: 0,
      };

      // Update state
      const state = await getInterviewState();
      if (state) {
        const updatedQuestions = state.questions.map((q, index) =>
          index === indexToUpdate ? newQuestion : q
        );
        state.questions = updatedQuestions;
        const timeLimit = getTimeLimitForDifficulty(newQuestion.difficulty);
        state.timerEndsAt = Date.now() + timeLimit * 1000;
        state.isPaused = false;
        state.currentIndex = indexToUpdate; // Ensure current index is set correctly
        await saveInterviewState(state);

        setQuestions([...state.questions]);
        setTimeLeft(timeLimit);
        setIsPaused(false);
        setCurrentAnswer("");
        setShowNextButton(false);
      }
    } catch (error) {
      console.error("Error generating question:", error);
    } finally {
      setLoader(false);
    }
  };

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

  // Timer effect
  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !isInterviewComplete && !showNextButton) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isPaused, isInterviewComplete, showNextButton]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isInterviewComplete && !showNextButton) {
      handleSubmitAnswer();
    }
  }, [timeLeft, isInterviewComplete, showNextButton]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() && timeLeft === 0) {
      // Fetch solution from new API endpoint
      try {
        const updatedQuestions = questions.map((q, index) =>
          index === currentQuestionIndex
            ? {
                ...q,
                answer: "", // Set the fetched solution as the answer
                score: 0, // Score is 0
                feedback:
                  "Time up! No answer submitted. Solution automatically provided.",
                timeSpent:
                  getTimeLimitForDifficulty(currentQuestion.difficulty) -
                  timeLeft, // Full time spent
                submittedAt: Date.now(),
                rawSolution: "",
              }
            : q
        );

        const state = await getInterviewState();
        if (state) {
          state.questions = updatedQuestions;
          state.isPaused = true; // Stop timer
          await saveInterviewState(state);
        }
        setQuestions(updatedQuestions);
        setIsPaused(true);
        setShowNextButton(true);
      } catch (error) {
        console.error("Error fetching solution on time up:", error);
        // Proceed without solution if fetching fails
        const updatedQuestions = questions.map((q, index) =>
          index === currentQuestionIndex
            ? {
                ...q,
                answer: "",
                score: 0,
                feedback:
                  "Time up! No answer submitted. Failed to load solution.",
                timeSpent:
                  getTimeLimitForDifficulty(currentQuestion.difficulty) -
                  timeLeft,
                submittedAt: Date.now(),
              }
            : q
        );
        const state = await getInterviewState();
        if (state) {
          state.questions = updatedQuestions;
          state.isPaused = true;
          await saveInterviewState(state);
        }
        setQuestions(updatedQuestions);
        setIsPaused(true);
        setShowNextButton(true);
      }
      return;
    }

    if (!currentAnswer.trim() && timeLeft > 0) return;

    setIsSubmitting(true);

    try {
      // Get AI evaluation
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate answer");

      const evaluation = await response.json();
      const timeSpent =
        getTimeLimitForDifficulty(currentQuestion.difficulty) - timeLeft;

      // Update question with answer and evaluation
      const updatedQuestions = questions.map((q, index) =>
        index === currentQuestionIndex
          ? {
              ...q,
              answer: currentAnswer,
              score: evaluation.score,
              feedback: evaluation.feedback,
              timeSpent,
              submittedAt: Date.now(),
            }
          : q
      );

      // Update state in IndexedDB
      const state = await getInterviewState();
      if (state) {
        state.questions = updatedQuestions;
        state.isPaused = true; // Stop timer
        await saveInterviewState(state);
      }

      setQuestions(updatedQuestions);
      setIsPaused(true);
      setShowNextButton(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    // Ensure the current question has been processed (answered or time-upped)
    // Before moving to the next one.
    if (!currentQuestion || (!currentQuestion.answer && !showNextButton)) {
      console.warn(
        "Cannot move to next question: Current question not processed."
      );
      return;
    }

    setCurrentQuestionIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      if (nextIndex >= TOTAL_QUESTIONS) {
        // Interview complete
        const completeInterview = async () => {
          const state = await getInterviewState();
          if (state) {
            state.isComplete = true;
            await saveInterviewState(state);
          }
          setIsInterviewComplete(true);
          const candidate = await getCandidateData();
          localStorage.setItem("email", candidate?.email || "");
          await fetch("/api/interview", {
            method: "POST",
            body: JSON.stringify({
              questions: state?.questions || [],
              candidateData: candidate,
            }),
          });
        };
        completeInterview();
        return prevIndex; // Stay on the last question until interview completion UI is shown
      }

      const processNextQuestion = async () => {
        const state = await getInterviewState();
        if (!state) return;

        // Generate next question if it's a placeholder
        const nextQuestion = state.questions[nextIndex];
        if (nextQuestion && nextQuestion.id.startsWith("q_placeholder")) {
          await generateQuestion(nextIndex); // This function will update state in IndexedDB and component state
        } else {
          // If not a placeholder, just update state for next question
          state.currentIndex = nextIndex;
          const timeLimit = getTimeLimitForDifficulty(
            state.questions[nextIndex].difficulty
          );
          state.timerEndsAt = Date.now() + timeLimit * 1000;
          state.isPaused = false;
          await saveInterviewState(state);

          setQuestions([...state.questions]); // Update questions state from IndexedDB
          setTimeLeft(timeLimit);
          setIsPaused(false);
          setCurrentAnswer("");
          setShowNextButton(false);
        }
      };
      processNextQuestion();

      return nextIndex;
    });
  };

  const handlePauseResume = async () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    // Update state in IndexedDB
    const state = await getInterviewState();
    if (state) {
      state.isPaused = newPausedState;
      if (!newPausedState && state.timerEndsAt === 0) {
        state.timerEndsAt = Date.now() + timeLeft * 1000;
      }
      await saveInterviewState(state);
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return "text-red-500";
    if (timeLeft <= 10) return "text-yellow-500";
    return "text-green-500";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeLimitForDifficulty = (
    difficulty: "EASY" | "MEDIUM" | "HARD"
  ): number => {
    switch (difficulty) {
      case "EASY":
        return 20;
      case "MEDIUM":
        return 60;
      case "HARD":
        return 120;
      default:
        return 20; // Default to easy
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Maximize2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Fullscreen Required
            </h1>
            <p className="text-gray-600 mb-6">
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Interview Complete!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 0 }}
        className="bg-white border-r border-gray-200 overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
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

          {/* Timer */}
          <Card className="mb-6">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Time Remaining</span>
              </div>
              {loader ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 m-auto"></div>
              ) : (
                <div className={`text-3xl font-bold ${getTimerColor()}`}>
                  {timeLeft}s
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5
                      ? "bg-red-500"
                      : timeLeft <= 10
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${
                      (timeLeft /
                        getTimeLimitForDifficulty(currentQuestion.difficulty)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">
              Questions ({currentQuestionIndex + 1}/{TOTAL_QUESTIONS})
            </h4>
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => {
              const question = questions[index];
              const isCurrent = index === currentQuestionIndex;
              const isAnswered =
                question?.answer !== undefined && question.answer !== "";
              const isClickable = index === currentQuestionIndex;

              return (
                <motion.div
                  key={question?.id || `placeholder_${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg transition-all ${
                    isClickable
                      ? "cursor-pointer hover:bg-gray-200"
                      : "cursor-not-allowed opacity-50"
                  } ${
                    isCurrent
                      ? "bg-blue-100 border-2 border-blue-500"
                      : isAnswered
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                  onClick={() => isClickable && setCurrentQuestionIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCurrent
                          ? "bg-blue-500 text-white"
                          : isAnswered
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isAnswered ? "✓" : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {question?.question || `Question ${index + 1}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {question?.difficulty && (
                          <Badge
                            className={`text-xs ${getDifficultyColor(
                              question.difficulty
                            )}`}
                          >
                            {question.difficulty}
                          </Badge>
                        )}
                        {question?.score !== undefined && (
                          <span className="text-xs text-green-600">
                            {question.score}%
                          </span>
                        )}
                        {!isClickable && (
                          <span className="text-xs text-gray-500">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
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
                <h1 className="text-xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${
                      currentQuestion.difficulty === "EASY"
                        ? "bg-green-100 text-green-800"
                        : currentQuestion.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {candidateData.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                {loader ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <span className={`text-2xl font-bold ${getTimerColor()}`}>
                    {timeLeft}
                  </span>
                )}
              </div>
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
        {loader ? (
          <div className="flex-1 p-4 bg-gray-100 space-y-4">
            <Skeleton className="h-1/4 w-full rounded-lg" />
            <Skeleton className="h-1/4 w-full rounded-lg" />
            <Skeleton className="h-1/3 w-full rounded-lg" />
          </div>
        ) : (
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8 max-h-[200px] overflow-y-auto">
                    {currentQuestion.question}
                  </h2>

                  <div className="space-y-6">
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[150px] resize-none text-lg"
                      disabled={
                        isSubmitting ||
                        isPaused ||
                        (timeLeft === 0 && !currentAnswer.trim())
                      }
                    />

                    {timeLeft === 0 &&
                      !currentAnswer.trim() &&
                      currentQuestion.rawSolution && (
                        <div className="space-y-4 p-4 rounded-md bg-red-50 border border-red-200">
                          <h3 className="text-lg font-semibold text-red-700">
                            Time Up! No Answer Submitted.
                          </h3>
                          <div className="text-gray-700">
                            <h4 className="font-medium mb-2">
                              Suggested Solution:
                            </h4>
                            <p className="whitespace-pre-wrap">
                              {currentQuestion.rawSolution}
                            </p>
                          </div>
                        </div>
                      )}

                    {currentQuestion.feedback && currentQuestion.answer && (
                      <div className="space-y-4 p-4 rounded-md bg-blue-50 border border-blue-200 max-h-[200px] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-blue-700">
                          Feedback & Score: {currentQuestion.score}%
                        </h3>
                        <p className="text-gray-700">
                          {currentQuestion.feedback}
                        </p>
                        {currentQuestion.rawSolution && (
                          <div className="text-gray-700">
                            <h4 className="font-medium mb-2">
                              Suggested Solution:
                            </h4>
                            <p className="whitespace-pre-wrap">
                              {currentQuestion.rawSolution}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-500">
                          {currentAnswer.length} characters
                        </p>
                        {timeLeft <= 10 && timeLeft > 0 && (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Time running out!</span>
                          </div>
                        )}
                      </div>
                      {showNextButton ? (
                        <Button
                          onClick={handleNextQuestion}
                          size="lg"
                          className="px-8"
                        >
                          {questions.filter(
                            (q) => q.timeSpent && q.timeSpent > 0
                          ).length >= TOTAL_QUESTIONS ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Interview
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Next Question
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={
                            !currentAnswer.trim() ||
                            isSubmitting ||
                            (timeLeft === 0 && !currentAnswer.trim())
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
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
