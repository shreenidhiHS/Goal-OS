ALTER TABLE `goals` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `goals` ADD `reminder_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `reminder_time` text DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `color` text;