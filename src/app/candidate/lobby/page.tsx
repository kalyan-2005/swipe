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
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  User,
  Mail,
  Phone,
  Target,
  Play,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCandidateData } from "@/lib/indexedDB";

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}

export default function LobbyPage() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCandidateData = async () => {
    const data = await getCandidateData();
    if (data) {
      setCandidateData(data);
      } else {
        router.push("/candidate");
      }
    };
    fetchCandidateData();
    setIsLoading(false);
  }, [router]);

  const handleStartInterview = () => {
    router.push("/candidate/interview");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Swipe Interviews
              </span>
            </div>
            <Button variant="ghost" onClick={() => router.push("/candidate")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome, {candidateData.name}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              You're about to start your AI-powered interview
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Candidate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {candidateData.email}
                  </span>
                </div>
                {candidateData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {candidateData.phone}
                    </span>
                  </div>
                )}
                {candidateData.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Questions:
                    </span>
                    <span className="font-medium">6 total</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Difficulty:
                    </span>
                    <span className="font-medium">
                      2 Easy, 2 Medium, 2 Hard
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Time per question:
                    </span>
                    <span className="font-medium">20 seconds</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total time:
                    </span>
                    <span className="font-medium">~2-3 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Here's what to expect during your interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Answer Questions
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      You'll be asked 6 questions of varying difficulty. Answer
                      as completely as possible within the time limit.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Get Real-time Feedback
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Our AI will provide instant feedback on your answers and
                      score your responses.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Review Results
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      After completing all questions, you'll receive a detailed
                      performance report with recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready to Start */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
              <p className="text-blue-100 mb-6">
                Take a deep breath and click the button below when you're ready
                to start your interview.
              </p>
              <Button
                onClick={handleStartInterview}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
