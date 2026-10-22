ALTER TABLE `settings` ADD `civil_time` text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE `settings`
SET `civil_time` = '15:00', `ceremony_time` = '16:00'
WHERE `id` = 1 AND `ceremony_time` = '15:00' AND `civil_time` = '';