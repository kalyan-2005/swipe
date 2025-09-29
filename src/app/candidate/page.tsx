"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  AlertCircle,
  Bot,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { saveCandidateData, clearAllData } from "@/lib/indexedDB";

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}

interface ExtractedData {
  name: string;
  email: string;
  phone: string;
  found: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
}

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function CandidatePage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualData, setManualData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "upload" | "extract" | "verify" | "correct" | "complete"
  >("welcome");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const router = useRouter();

  // Initialize chatbot messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        type: "bot",
        content:
          "Hi there! 👋 I&apos;m your AI interview assistant. I&apos;ll help you get started with your interview preparation. First, I need to collect some basic information about you.",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "bot",
        content:
          "Could you please upload your resume? I&apos;ll extract your name, email, and phone number from it to get started.",
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
  }, []);

  const addMessage = useCallback(
    (content: string, type: "bot" | "user" = "user") => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  const addTypingMessage = useCallback(() => {
    const typingMessage: ChatMessage = {
      id: "typing",
      type: "bot",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);
  }, []);

  const removeTypingMessage = useCallback(() => {
    setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));
  }, []);

  const simulateBotResponse = useCallback(
    (response: string, delay: number = 1000) => {
      addTypingMessage();

      setTimeout(() => {
        removeTypingMessage();
        addMessage(response, "bot");
      }, delay);
    },
    [addMessage, addTypingMessage, removeTypingMessage]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      addMessage(`Uploaded file: ${file.name}`, "user");
      setIsUploading(true);
      setUploadError(null);
      setCurrentStep("extract");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to extract");
        }

        const data = await res.json();

        // defensive: ensure found object exists
        const found = data.found ?? {
          name: !!(data.name && data.name !== "Not found"),
          email: !!(data.email && data.email !== "Not found"),
          phone: !!(data.phone && data.phone !== "Not found"),
        };

        // Check if we found any information
        const foundAny = found.name || found.email || found.phone;

        if (foundAny) {
          setResumeData({
            name: data.name ?? "Not found",
            email: data.email ?? "Not found",
            phone: data.phone ?? "Not found",
            skills: [],
          });
          setManualData({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
          });

          // Build confirmation message
          let confirmationMessage =
            "Great! I found some information from your resume:\n\n";

          if (found.name) confirmationMessage += `• Name: ${data.name}\n`;
          if (found.email) confirmationMessage += `• Email: ${data.email}\n`;
          if (found.phone) confirmationMessage += `• Phone: ${data.phone}\n`;

          confirmationMessage += "\nIs this information correct?";

          simulateBotResponse(confirmationMessage, 2000);
          setShowConfirmation(true);
          setCurrentStep("verify");
        } else {
          simulateBotResponse(
            "I couldn&apos;t find your name, email, or phone number in the resume. Could you please provide your details manually?",
            2000
          );
          setCurrentStep("verify");
        }
      } catch (error) {
        console.error(error);
        simulateBotResponse(
          "Sorry, I couldn&apos;t process your resume. Could you please provide your details manually?",
          2000
        );
        setCurrentStep("verify");
      } finally {
        setIsUploading(false);
      }
    },
    [simulateBotResponse, addMessage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleManualInput = () => {
    if (!manualData.name || !manualData.email) {
      addMessage(
        "Please provide at least your name and email to continue.",
        "bot"
      );
      return;
    }

    addMessage(
      `Name: ${manualData.name}\nEmail: ${manualData.email}\nPhone: ${
        manualData.phone || "Not provided"
      }`,
      "user"
    );
    simulateBotResponse(
      "Perfect! I have all the information I need. Let me prepare your interview session...",
      1500
    );

    setTimeout(async () => {
      const candidateData = {
        id: `candidate_${Date.now()}`,
        ...manualData,
        skills: resumeData?.skills || [],
        createdAt: Date.now(),
      };
      await saveCandidateData(candidateData);
      router.push("/candidate/lobby");
    }, 3000);
  };

  const handleConfirmInfo = () => {
    addMessage("Yes, that&apos;s correct!", "user");
    setShowConfirmation(false);
    simulateBotResponse(
      "Excellent! Let me prepare your interview session...",
      1500
    );

    setTimeout(async () => {
      const candidateData = {
        id: `candidate_${Date.now()}`,
        ...manualData,
        skills: resumeData?.skills || [],
        createdAt: Date.now(),
      };
      await saveCandidateData(candidateData);
      router.push("/candidate/lobby");
    }, 3000);
  };

  const handleRejectInfo = () => {
    addMessage("No, that&apos;s not correct", "user");
    setShowConfirmation(false);
    simulateBotResponse(
      "No problem! Please correct the information below and I&apos;ll use the updated details.",
      1500
    );
    setCurrentStep("correct");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Interview Assistant
              </span>
            </div>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col overflow-y-auto">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>AI is typing...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Upload Area */}
              {currentStep === "welcome" && (
                <div className="border-t p-6">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Processing your resume...
                        </p>
                      </div>
                    ) : isDragActive ? (
                      <p className="text-blue-600 dark:text-blue-400">
                        Drop your resume here...
                      </p>
                    ) : (
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Drag &amp; drop your resume here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Supports PDF files only
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Buttons */}
              {currentStep === "verify" && showConfirmation && (
                <div className="border-t p-6">
                  <div className="flex gap-2">
                    <Button onClick={handleConfirmInfo} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yes, that&apos;s correct
                    </Button>
                    <Button
                      onClick={handleRejectInfo}
                      variant="outline"
                      className="flex-1"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No, that&apos;s not correct
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual Input Form */}
              {(currentStep === "verify" && !showConfirmation) ||
              currentStep === "correct" ? (
                <div className="border-t p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={manualData.name}
                        onChange={(e) =>
                          setManualData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualData.email}
                        onChange={(e) =>
                          setManualData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter your email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={manualData.phone}
                      onChange={(e) =>
                        setManualData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>

                  {resumeData?.skills && resumeData.skills.length > 0 && (
                    <div>
                      <Label>Skills Detected</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resumeData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualInput}
                      variant="outline"
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Details
                    </Button>
                  </div>
                </div>
              ) : null}

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="h-5 w-5" />
                  {uploadError}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
