"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Clock, Target, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto p-4 max-sm:p-2">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Image src="/logo.svg" alt="Logo" width={100} height={100} className="max-sm:w-20" />
            </motion.div>
            <div className="flex items-center space-x-4 max-sm:space-x-2">
              <ThemeToggle />
              <Button variant="secondary" asChild  className="max-sm:hidden">
                <Link href="/interviewer">Interviewer Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/candidate">Start Interview</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex justify-between items-center max-md:flex-wrap-reverse">
        <div className="max-w-4xl mx-auto max-md:mt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="bg-green-100 border-2 border-green-400 inline p-1 px-2 rounded-full font-semibold text-xs">
              100% Simple & Effective!
            </p>
            <h1 className="text-xl md:text-5xl font-bold text-gray-900 dark:text-white my-8">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Interview Assistant
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Practice interviews with live scoring and AI feedback.
              <br />
              Get instant insights to improve your performance.
            </p>
            <div className="flex gap-4 max-sm:justify-center">
              <Button size="lg" className="text-lg px-8 py-6 max-sm:p-2 max-sm:text-xs" asChild>
                <Link href="/candidate">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 max-sm:p-2 max-sm:text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                asChild
              >
                <Link href="/interviewer">Interviewer Login</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <div>
          <Image src="/hero.png" alt="Hero" width={1000} height={1000} />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Your Interview Potential
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Leverage our cutting-edge AI to refine your interview skills and
            boost your confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Brain,
              title: "Intelligent Questioning",
              description:
                "Our AI generates tailored questions based on your resume and desired role, ensuring relevant practice.",
            },
            {
              icon: Clock,
              title: "Instant Performance Feedback",
              description:
                "Receive immediate, objective feedback on your responses, including clarity, confidence, and relevance.",
            },
            {
              icon: Target,
              title: "Comprehensive Skill Analysis",
              description:
                "Get a detailed breakdown of your strengths and areas for improvement across various technical and soft skills.",
            },
            {
              icon: CheckCircle,
              title: "Actionable Improvement Plans",
              description:
                "Beyond scores, we provide concrete recommendations and resources to help you elevate your performance.",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
                <CardHeader className="text-center flex-grow flex flex-col justify-center">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit shadow-md">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-start">
                  <CardDescription className="text-center text-base text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Path to Interview Success in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Seamlessly prepare and excel with our intuitive AI-driven
              platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Personalize Your Practice",
                description:
                  "Upload your resume and specify the role you're targeting. Our AI will customize your interview experience.",
              },
              {
                step: "02",
                title: "Engage in Realistic Interviews",
                description:
                  "Participate in a dynamic Q&A session with our AI interviewer, designed to simulate real-world scenarios.",
              },
              {
                step: "03",
                title: "Review & Refine",
                description:
                  "Access detailed performance reports, identify areas for improvement, and track your progress over time.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-850"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-10 max-sm:p-4 rounded-lg shadow-xl border border-blue-100 dark:border-gray-700"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 max-sm:text-2xl">
            Ready to Transform Your Interview Preparation?
          </h2>
          <p className="sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join a thriving community of job seekers who are mastering their
            interviews with our AI-powered guidance.
          </p>
          <Button
            size="lg"
            className="sm:text-xl px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link href="/candidate">
              Start Your Interview Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Swipe Interviews. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
