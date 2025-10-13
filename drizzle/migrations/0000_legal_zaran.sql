CREATE TABLE "boards" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"words" json NOT NULL,
	"board" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
