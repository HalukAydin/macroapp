import {
  pgTable,
  serial,
  text,
  integer,
  real,
  date,
  timestamp,
  pgEnum
} from "drizzle-orm/pg-core";

export const activityLevelEnum = pgEnum("activity_level", [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active"
]);

export const goalEnum = pgEnum("goal", ["cut", "maintain", "bulk"]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  activityLevel: activityLevelEnum("activity_level").notNull(),
  goal: goalEnum("goal").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weightKg: real("weight_kg").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  foodName: text("food_name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  grams: real("grams").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
