CREATE TABLE "core"."plugin_storage" (
	"id" text PRIMARY KEY NOT NULL,
	"plugin_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_storage_plugin_id_key_key" ON "core"."plugin_storage" USING btree ("plugin_id","key");