CREATE SCHEMA "plugin_official_checkin";
--> statement-breakpoint
CREATE TABLE "plugin_official_checkin"."checkin" (
	"id" text PRIMARY KEY NOT NULL,
	"viewerId" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
