CREATE TABLE "core"."plugin_migration" (
	"id" text PRIMARY KEY NOT NULL,
	"plugin_id" text NOT NULL,
	"migration_name" text NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "plugin_migration_plugin_id_migration_name_key" ON "core"."plugin_migration" USING btree ("plugin_id","migration_name");