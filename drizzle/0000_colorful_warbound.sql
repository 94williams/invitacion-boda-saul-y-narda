CREATE TABLE `guests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`attendance` text NOT NULL,
	`guests` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_token_hash_unique` ON `guests` (`token_hash`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`event_date` text DEFAULT '' NOT NULL,
	`ceremony_time` text DEFAULT '' NOT NULL,
	`reception_time` text DEFAULT '' NOT NULL,
	`venue_name` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`maps_url` text DEFAULT '' NOT NULL,
	`audio_key` text DEFAULT '' NOT NULL,
	`audio_type` text DEFAULT '' NOT NULL,
	`audio_updated_at` text DEFAULT '' NOT NULL
);
