CREATE TABLE "demo_marker" (
	"id" integer PRIMARY KEY NOT NULL,
	"environment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Značka demo databáze (src/lib/demo/db/guard.ts). Ve stejné migraci jako tabulka, aby nezůstala tabulka bez značky.
INSERT INTO "demo_marker" ("id", "environment") VALUES (1, 'prvotka-demo') ON CONFLICT ("id") DO NOTHING;
