CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"mv" integer DEFAULT 1,
	"status" varchar(64) DEFAULT 'enabled' NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"default" boolean,
	"identifier" varchar(128) NOT NULL,
	"name" varchar(64),
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"mv" integer DEFAULT 1,
	"status" varchar(64) DEFAULT 'valid' NOT NULL,
	"handle" varchar(64) NOT NULL,
	"name" varchar(64) NOT NULL,
	"name_last" varchar(128),
	"type" varchar(32) DEFAULT 'individual' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accountUniqueIndex" ON "accounts" ("user_id","type","identifier");