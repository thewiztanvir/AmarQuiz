import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { documents } from "./documents";

export const quizStatusEnum = pgEnum("quiz_status", [
  "generating",
  "ready",
  "error",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const quizzes = pgTable("quizzes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  documentId: text("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  topic: text("topic"),
  difficulty: difficultyEnum("difficulty").default("medium").notNull(),
  questionCount: integer("question_count").notNull(),
  questions: jsonb("questions"), // Array of Question objects
  status: quizStatusEnum("status").default("generating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  score: integer("score").notNull(), // percentage 0-100
  answers: jsonb("answers"), // { questionId: selectedOption }
  timeTakenSeconds: integer("time_taken_seconds"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
