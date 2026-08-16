CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TYPE "core"."platform" AS ENUM('twitch', 'youtube');--> statement-breakpoint
CREATE TABLE "core"."currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_key_unique" UNIQUE("key")
);
--> statement-breakpoint
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
CREATE TABLE "core"."transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"source" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewer_id" text NOT NULL,
	"currency_id" text NOT NULL
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
CREATE TABLE "core"."wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewer_id" text NOT NULL,
	"currency_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."identities" ADD CONSTRAINT "identities_viewer_id_viewers_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "core"."viewers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."transactions" ADD CONSTRAINT "transactions_viewer_id_viewers_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "core"."viewers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."transactions" ADD CONSTRAINT "transactions_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "core"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."wallets" ADD CONSTRAINT "wallets_viewer_id_viewers_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "core"."viewers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."wallets" ADD CONSTRAINT "wallets_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "core"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "identities_platform_platform_user_id_key" ON "core"."identities" USING btree ("platform","platform_user_id");--> statement-breakpoint
CREATE INDEX "identities_viewer_id_idx" ON "core"."identities" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "transactions_viewer_id_idx" ON "core"."transactions" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "transactions_currency_id_idx" ON "core"."transactions" USING btree ("currency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_viewer_id_currency_id_key" ON "core"."wallets" USING btree ("viewer_id","currency_id");