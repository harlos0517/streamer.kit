CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TYPE "core"."platform" AS ENUM('twitch', 'youtube');--> statement-breakpoint
CREATE TABLE "core"."identities" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" "core"."platform" NOT NULL,
	"platform_user_id" text NOT NULL,
	"platform_display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewer_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."plugin_migration" (
	"id" text PRIMARY KEY NOT NULL,
	"plugin_id" text NOT NULL,
	"migration_name" text NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."plugin_storage" (
	"id" text PRIMARY KEY NOT NULL,
	"plugin_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."viewers" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."identities" ADD CONSTRAINT "identities_viewer_id_viewers_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "core"."viewers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "identities_platform_platform_user_id_key" ON "core"."identities" USING btree ("platform","platform_user_id");--> statement-breakpoint
CREATE INDEX "identities_viewer_id_idx" ON "core"."identities" USING btree ("viewer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_migration_plugin_id_migration_name_key" ON "core"."plugin_migration" USING btree ("plugin_id","migration_name");--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_storage_plugin_id_key_key" ON "core"."plugin_storage" USING btree ("plugin_id","key");