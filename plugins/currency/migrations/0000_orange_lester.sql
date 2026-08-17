CREATE SCHEMA "plugin_official_currency";
--> statement-breakpoint
CREATE TABLE "plugin_official_currency"."currency" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "plugin_official_currency"."transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"viewerId" text NOT NULL,
	"currencyId" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
