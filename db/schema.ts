import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const guests = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenHash: text("token_hash").notNull().unique(),
  name: text("name").notNull(),
  attendance: text("attendance", { enum: ["yes", "no"] }).notNull(),
  guests: integer("guests").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  eventDate: text("event_date").notNull().default(""),
  ceremonyTime: text("ceremony_time").notNull().default(""),
  receptionTime: text("reception_time").notNull().default(""),
  venueName: text("venue_name").notNull().default(""),
  address: text("address").notNull().default(""),
  mapsUrl: text("maps_url").notNull().default(""),
  giftRegistryName: text("gift_registry_name").notNull().default(""),
  giftRegistryUrl: text("gift_registry_url").notNull().default(""),
  giftRegistryName2: text("gift_registry_name_2").notNull().default(""),
  giftRegistryUrl2: text("gift_registry_url_2").notNull().default(""),
  audioKey: text("audio_key").notNull().default(""),
  audioType: text("audio_type").notNull().default(""),
  audioUpdatedAt: text("audio_updated_at").notNull().default(""),
});

export const loginAttempts = sqliteTable("login_attempts", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  windowStart: integer("window_start").notNull(),
});
