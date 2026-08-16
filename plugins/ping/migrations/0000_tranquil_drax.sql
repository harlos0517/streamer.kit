CREATE SCHEMA "plugin_demo_ping";
--> statement-breakpoint
CREATE TABLE "plugin_demo_ping"."ping_log" (
	"id" text PRIMARY KEY NOT NULL,
	"platformDisplayName" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
