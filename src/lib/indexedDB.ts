import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "interviewDB";
const QUESTIONS_STORE = "questions";
const STATE_STORE = "state";
const CANDIDATE_STORE = "candidate";

interface Question {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
  submittedAt?: number;
  rawSolution?: string;
}

interface InterviewState {
  id: string;
  questions: Question[];
  currentIndex: number;
  timerEndsAt: number;
  isPaused: boolean;
  isComplete: boolean;
  createdAt: number;
  updatedAt: number;
}

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db) {
        // Questions store
        if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
          db.createObjectStore(QUESTIONS_STORE, { keyPath: "id" });
        }

        // State store
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE, { keyPath: "id" });
        }

        // Candidate store
        if (!db.objectStoreNames.contains(CANDIDATE_STORE)) {
          db.createObjectStore(CANDIDATE_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
};

// Question operations
export const saveQuestion = async (question: Question) => {
  const db = await initDB();
  await db.put(QUESTIONS_STORE, question);
};

export const getAllQuestions = async (): Promise<Question[]> => {
  const db = await initDB();
  return db.getAll(QUESTIONS_STORE);
};

export const getQuestionById = async (
  id: string
): Promise<Question | undefined> => {
  const db = await initDB();
  return db.get(QUESTIONS_STORE, id);
};

export const deleteQuestion = async (id: string) => {
  const db = await initDB();
  await db.delete(QUESTIONS_STORE, id);
};

export const clearQuestions = async () => {
  const db = await initDB();
  await db.clear(QUESTIONS_STORE);
};

// State operations
export const saveInterviewState = async (state: InterviewState) => {
  const db = await initDB();
  await db.put(STATE_STORE, { ...state, updatedAt: Date.now() });
};

export const getInterviewState = async (): Promise<InterviewState | null> => {
  const db = await initDB();
  const states = await db.getAll(STATE_STORE);
  return states.length > 0 ? states[states.length - 1] : null;
};

export const clearInterviewState = async () => {
  const db = await initDB();
  await db.clear(STATE_STORE);
};

// Candidate operations
export const saveCandidateData = async (candidate: CandidateData) => {
  const db = await initDB();
  await db.put(CANDIDATE_STORE, candidate);
};

export const getCandidateData = async (): Promise<CandidateData | null> => {
  const db = await initDB();
  const candidates = await db.getAll(CANDIDATE_STORE);
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
};

export const clearCandidateData = async () => {
  const db = await initDB();
  await db.clear(CANDIDATE_STORE);
};

// Clear all data
export const clearAllData = async () => {
  const db = await initDB();
  await db.clear(QUESTIONS_STORE);
  await db.clear(STATE_STORE);
  await db.clear(CANDIDATE_STORE);
};

export type { Question, InterviewState, CandidateData };
