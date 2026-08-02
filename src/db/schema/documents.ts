import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const documentStatusEnum = pgEnum("document_status", [
  "processing",
  "ready",
  "error",
]);

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(), // "pdf" | "docx" | "txt" | "md"
  fileSize: integer("file_size").notNull(), // in bytes
  extractedText: text("extracted_text"),
  status: documentStatusEnum("status").default("processing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
