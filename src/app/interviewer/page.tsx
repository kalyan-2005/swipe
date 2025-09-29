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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Candidate, Interview, Question } from "@prisma/client";

interface PopulatedInterview extends Interview {
  candidate: Candidate;
  questions: Question[];
}

export default function InterviewerDashboard() {
  const [candidates, setCandidates] = useState<PopulatedInterview[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<
    PopulatedInterview[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      setCandidates(result);
      setFilteredCandidates(result);
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    let filtered = candidates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (interview) =>
          interview.candidate.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          interview.candidate.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    // Score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter((interview) => {
        const averageScore =
          interview.questions.length > 0
            ? interview.questions.reduce(
                (sum: number, question: Question) =>
                  sum + (question.score || 0),
                0
              ) / interview.questions.length
            : 0;
        if (scoreFilter === "high") return averageScore >= 80;
        if (scoreFilter === "medium")
          return averageScore >= 60 && averageScore < 80;
        if (scoreFilter === "low") return averageScore < 60 && averageScore > 0;
        return true;
      });
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "name":
            aValue = a.candidate.name;
            bValue = b.candidate.name;
            break;
          case "email":
            aValue = a.candidate.email;
            bValue = b.candidate.email;
            break;
          case "averageScore":
            aValue =
              a.questions.length > 0
                ? a.questions.reduce(
                    (sum: number, question: Question) =>
                      sum + (question.score || 0),
                    0
                  ) / a.questions.length
                : 0;
            bValue =
              b.questions.length > 0
                ? b.questions.reduce(
                    (sum: number, question: Question) =>
                      sum + (question.score || 0),
                    0
                  ) / b.questions.length
                : 0;
            break;
          case "date":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "timeSpent":
            aValue =
              a.questions.length > 0
                ? a.questions.reduce(
                    (sum: number, question: Question) =>
                      sum + (question.timeSpent || 0),
                    0
                  )
                : 0;
            bValue =
              b.questions.length > 0
                ? b.questions.reduce(
                    (sum: number, question: Question) =>
                      sum + (question.timeSpent || 0),
                    0
                  )
                : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, scoreFilter, sortConfig]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score > 0) return "text-red-600 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const handleSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl max-sm:text-sm font-bold text-gray-900 dark:text-white">
                Interviewer Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                variant="outline"
                className="hover:bg-gray-100 max-sm:hidden"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-sm:p-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="sm:p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={`Search candidates by name or email...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 max-sm:text-xs">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Scores</option>
                    <option value="high">High (80%+)</option>
                    <option value="medium">Medium (60-79%)</option>
                    <option value="low">Low (&lt;60%)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Candidates ({filteredCandidates.length})</CardTitle>
              <CardDescription>
                Click on a candidate to view detailed interview results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-sm:text-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort("name")}
                      >
                        Name
                        {sortConfig?.key === "name" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort("email")}
                      >
                        Email
                        {sortConfig?.key === "email" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort("averageScore")}
                      >
                        Average Score
                        {sortConfig?.key === "averageScore" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort("timeSpent")}
                      >
                        Time Spent
                        {sortConfig?.key === "timeSpent" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort("date")}
                      >
                        Date
                        {sortConfig?.key === "date" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((interview) => (
                      <TableRow
                        key={interview.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 max-sm:text-xs"
                      >
                        <TableCell className="font-medium">
                          {interview.candidate.name}
                        </TableCell>
                        <TableCell>{interview.candidate.email}</TableCell>
                        <TableCell>
                          <span
                            className={getScoreColor(
                              interview.questions.length > 0
                                ? interview.questions.reduce(
                                    (sum: number, question: Question) =>
                                      sum + (question.score || 0),
                                    0
                                  ) / interview.questions.length
                                : 0
                            )}
                          >
                            {interview.questions.length > 0
                              ? `${Math.round(
                                  interview.questions.reduce(
                                    (sum: number, question: Question) =>
                                      sum + (question.score || 0),
                                    0
                                  ) / interview.questions.length
                                )}%`
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {interview.questions.length > 0
                            ? interview.questions.reduce(
                                (sum: number, question: Question) =>
                                  sum + (question.timeSpent || 0),
                                0
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {interview.createdAt
                            ? new Date(interview.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/interviewer/candidate/${interview.id}`
                                )
                              }
                              className="hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-gray-100"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No candidates found matching your criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
