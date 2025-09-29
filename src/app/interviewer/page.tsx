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
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Candidate } from "@prisma/client";

export default function InterviewerDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in-progress" | "not-started"
  >("all");
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
        (candidate) =>
          candidate.candidate.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.candidate.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    // Score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter((candidate) => {
        const averageScore =
          candidate.questions.length > 0
            ? candidate.questions.reduce(
                (sum, question) => sum + question.score,
                0
              ) / candidate.questions.length
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
                    (sum, question) => sum + question.score,
                    0
                  ) / a.questions.length
                : 0;
            bValue =
              b.questions.length > 0
                ? b.questions.reduce(
                    (sum, question) => sum + question.score,
                    0
                  ) / b.questions.length
                : 0;
            break;
          case "date":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
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
  }, [candidates, searchTerm, statusFilter, scoreFilter, sortConfig]);

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

  // return JSON.stringify(filteredCandidates, null, 2);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Interviewer Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                variant="outline"
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

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search candidates by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
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
              <div className="overflow-x-auto">
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
                      {/* <TableHead>Skills</TableHead> */}
                      {/* <TableHead>Interviews</TableHead> */}
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
                        onClick={() => handleSort("date")}
                      >
                        Date
                        {sortConfig?.key === "date" && (
                          <span>
                            {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </TableHead>
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow
                        key={candidate.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          {candidate.candidate.name}
                        </TableCell>
                        <TableCell>{candidate.candidate.email}</TableCell>
                        {/* <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.candidate.skills.length > 0 ? candidate.candidate.skills
                              .slice(0, 2)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              )) : null}
                            {candidate.skills.length > 2 ? (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 2}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <span
                            className={getScoreColor(
                              candidate.questions.length > 0
                                ? candidate.questions.reduce(
                                    (sum, question) => sum + question.score,
                                    0
                                  ) / candidate.questions.length
                                : 0
                            )}
                          >
                            {candidate.questions.length > 0
                              ? `${
                                  candidate.questions.reduce(
                                    (sum, question) => sum + question.score,
                                    0
                                  ) / candidate.questions.length
                                }%`
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {candidate.createdAt
                            ? new Date(candidate.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/interviewer/candidate/${candidate.id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
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
