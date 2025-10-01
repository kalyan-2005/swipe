"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCandidateData } from "@/lib/indexedDB";
import { ArrowLeft, Target } from "lucide-react";
import Image from "next/image";

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}

export default function LobbyPage() {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkCandidateAndEmail = async () => {
      const data = await getCandidateData();
      if (!data) {
        router.push("/candidate");
        return;
      }

      setCandidate(data);

      // Check if user already has an interview
      try {
        const response = await fetch(
          `/api/interview-by-email?email=${data.email}`
        );
        if (response.ok) {
          // User already has an interview, redirect to results
          localStorage.setItem("email", data.email);
          router.push("/candidate/results");
        } else {
          // No existing interview, allow to start
          setIsCheckingEmail(false);
        }
      } catch (error) {
        console.error("Error checking existing interview:", error);
        // If there's an error, allow to proceed
        setIsCheckingEmail(false);
      }
    };

    checkCandidateAndEmail();
  }, [router]);

  const startInterview = () => router.push("/candidate/interview");

  if (!candidate || isCheckingEmail) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Swipe Interviews
                </span>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center sm:p-6">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Checking Interview Status...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your interview eligibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}{" "}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {" "}
        <div className="container mx-auto px-4 py-4">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center space-x-2">
              {" "}
              <Target className="h-8 w-8 text-blue-600" />{" "}
              <span className="sm:text-2xl font-bold text-gray-900 dark:text-white">
                {" "}
                Swipe Interviews{" "}
              </span>{" "}
            </div>{" "}
            <Button
              variant="outline"
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push("/candidate")}
            >
              {" "}
              <ArrowLeft className="h-4 w-4 mr-2" /> Back{" "}
            </Button>{" "}
          </div>{" "}
        </div>{" "}
      </nav>
      <div className="flex flex-1 items-center justify-center sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <Card className="">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="sm:text-2xl font-bold text-blue-600">
                Full Stack Developer Interview Test
              </CardTitle>
              <Button
                size="lg"
                onClick={startInterview}
                className="bg-blue-500 hover:bg-blue-600 font-semibold px-6 py-4 cursor-pointer"
              >
                Start Interview
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Instructions */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="list-decimal list-inside text-gray-800 sm:space-y-2">
                  <li>
                    This is a timed interview. Once started, the timer cannot be
                    paused or restarted.
                  </li>
                  <li>Ensure a stable internet connection before you begin.</li>
                  <li>
                    You will answer 6 AI-generated questions: 2 Easy, 2 Medium,
                    and 2 Hard.
                  </li>
                  <li>
                    The AI will auto-submit your answer when time expires for a
                    question.
                  </li>
                  <li>
                    After completion, you’ll receive an AI-generated score and
                    performance summary.
                  </li>
                </ol>
              </section>

              {/* Test Format */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Test Format</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border rounded-xl">
                    <thead className="bg-blue-500 text-white rounded-xl">
                      <tr className="rounded-t-xl">
                        <th className="py-2 px-4 max-sm:hidden">No.</th>
                        <th className="py-2 px-4">Section</th>
                        <th className="py-2 px-4">Questions</th>
                        <th className="py-2 px-4">Timer (Each)</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      <tr className="">
                        <td className="py-2 px-4 max-sm:hidden">1</td>
                        <td className="py-2 px-4">Easy</td>
                        <td className="py-2 px-4">2</td>
                        <td className="py-2 px-4">20s</td>
                      </tr>
                      <tr className="">
                        <td className="py-2 px-4 max-sm:hidden">2</td>
                        <td className="py-2 px-4">Medium</td>
                        <td className="py-2 px-4">2</td>
                        <td className="py-2 px-4">60s</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 max-sm:hidden">3</td>
                        <td className="py-2 px-4">Hard</td>
                        <td className="py-2 px-4">2</td>
                        <td className="py-2 px-4">120s</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Candidate quick note */}
              <div className="flex justify-between items-center max-sm:text-xs max-sm:flex-col">
                <p className="sm:text-sm">
                  Candidate:{" "}
                  <span className="font-medium">{candidate.name}</span> —{" "}
                  {candidate.email}
                </p>
                <div className="flex items-center gap-2 max-sm:mt-2">
                  <h1 className="text-gray-600">Powered By</h1>
                  <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="mx-auto max-sm:w-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
