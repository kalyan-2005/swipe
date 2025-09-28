import { openDB } from "idb";

const DB_NAME = "interviewDB";
const STORE_NAME = "questions";

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

export const saveQuestion = async (question: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, question);
};

export const getAllQuestions = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearDB = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
