CREATE TABLE `activity_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`application_name` text NOT NULL,
	`window_title` text NOT NULL,
	`process_name` text,
	`process_id` integer,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration` integer
);
--> statement-breakpoint
CREATE TABLE `application_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`application_name` text NOT NULL,
	`total_duration` integer DEFAULT 0 NOT NULL,
	`open_count` integer DEFAULT 0 NOT NULL,
	`average_session` integer DEFAULT 0 NOT NULL,
	`longest_session` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `daily_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`screen_time` integer DEFAULT 0 NOT NULL,
	`focus_time` integer DEFAULT 0 NOT NULL,
	`idle_time` integer DEFAULT 0 NOT NULL,
	`tasks_completed` integer DEFAULT 0 NOT NULL,
	`productivity_score` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_stats_date_unique` ON `daily_stats` (`date`);--> statement-breakpoint
CREATE TABLE `focus_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`application_name` text NOT NULL,
	`task_id` text,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration` integer
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`start_date` text,
	`target_date` text,
	`color` text,
	`icon` text,
	`status` text DEFAULT 'active' NOT NULL,
	`progress` real DEFAULT 0 NOT NULL,
	`hours_invested` real DEFAULT 0 NOT NULL,
	`tasks_completed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`modified_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idle_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration` integer,
	`reason` text DEFAULT 'inactivity' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`scheduled_at` text,
	`sent_at` text,
	`read_at` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` text,
	`due_time` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`estimated_duration` integer,
	`actual_duration` integer,
	`category` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`goal_id` text,
	`color` text,
	`notes` text,
	`created_at` text NOT NULL,
	`modified_at` text NOT NULL,
	`completed_at` text
);
