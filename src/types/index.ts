export type Status = "pending" | "paid";
export interface Expense { id: string; date: string; description: string; categoryId: string; amount: number; status: Status; paidAt: string | null; notes: string; origin: { type: "manual" | "recurring" | "invoice"; refId: string | null; month: string } }
export interface Category { id: string; name: string; color: string }
export interface Card { id: string; name: string; closingDay: number; dueDay: number; limit: number | null; color: string }
export interface Invoice { id: string; cardId: string; month: string; amount: number; dueDate: string; status: Status; paidAt: string | null; notes: string }
export interface Recurring { id: string; name: string; defaultAmount: number; categoryId: string; dueDay: number; frequency: "monthly" | "yearly"; startDate: string; endDate: string | null; active: boolean }
export interface Commitment { id: string; description: string; cardId: string; amount: number; type: "installment" | "recurring"; totalInstallments: number | null; currentInstallment: number; referenceMonth: string; status: "active" | "finished" }
export interface Db {
  version: number; revision: number; createdAt: string; updatedAt: string;
  settings: Record<string, unknown>; categories: Category[]; cards: Card[]; expenses: Expense[];
  recurringExpenses: Recurring[]; invoices: Invoice[]; commitments: Commitment[]; deleted: { id: string; collection: string; deletedAt: string }[];
}
export type Collection = "categories" | "cards" | "expenses" | "recurringExpenses" | "invoices" | "commitments";
export type Op = { type: "upsert"; collection: Collection; item: { id: string } & Record<string, unknown> } | { type: "delete"; collection: Collection; id: string };
