CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"do_now" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
