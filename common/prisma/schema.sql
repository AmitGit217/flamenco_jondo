-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: PostgreSQL
-- Generated at: 2025-02-20T19:55:10.034Z

CREATE TYPE "artisttype" AS ENUM (
  'CANTE',
  'GUITARRA',
  'BAILE'
);

CREATE TYPE "tonalities" AS ENUM (
  'LOCRIO',
  'FRIGIO',
  'MENOR',
  'DORICO',
  'MXIOLIDIO',
  'MAYOR',
  'LIDIO'
);

CREATE TYPE "keys" AS ENUM (
  'A',
  'Bb',
  'B',
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab'
);

CREATE TYPE "role" AS ENUM (
  'MASTER',
  'ADMIN',
  'USER'
);

CREATE TABLE "user" (
  "id" serial PRIMARY KEY,
  "email" varchar(255) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "role" role DEFAULT 'USER',
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "palo" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "origin" varchar(255) NOT NULL,
  "origin_date" timestamp NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "estilo" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "tonality" tonalities NOT NULL,
  "key" keys NOT NULL,
  "origin" varchar(255) NOT NULL,
  "origin_date" timestamp NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "artist" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "birth_year" int,
  "death_year" int,
  "origin" varchar(255),
  "type" artisttype NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "compas" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "beats" int NOT NULL,
  "accents" int[] NOT NULL,
  "silences" int[],
  "time_signatures" text[] NOT NULL,
  "bpm" int NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "letra" (
  "id" serial PRIMARY KEY,
  "estilo_id" int NOT NULL,
  "name" varchar(255) UNIQUE NOT NULL,
  "verses" text[] NOT NULL,
  "rhyme_scheme" int[] NOT NULL,
  "repetition_pattern" int[] NOT NULL,
  "structure" varchar(255) NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "palo_estilo" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "palo_id" int NOT NULL,
  "estilo_id" int NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "artist_estilo" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "artist_id" int NOT NULL,
  "estilo_id" int NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "palo_compas" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "palo_id" int NOT NULL,
  "compas_id" int NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "letra_artist" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "letra_id" int NOT NULL,
  "artist_id" int NOT NULL,
  "recording_url" varchar(255),
  "album" varchar(255),
  "year" int,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "letra_palo" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "letra_id" int NOT NULL,
  "palo_id" int NOT NULL,
  "user_create_id" int NOT NULL,
  "user_update_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "feedback" (
  "id" serial PRIMARY KEY,
  "user_id" int,
  "email" varchar(255),
  "comment" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE INDEX "unique_user_email" ON "user" ("email");

CREATE INDEX "unique_palo_name" ON "palo" ("name");

CREATE INDEX "unique_estilo_name" ON "estilo" ("name");

CREATE INDEX "unique_artist_name" ON "artist" ("name");

CREATE INDEX "unique_compas_name" ON "compas" ("name");

CREATE INDEX "idx_letra_estilo_id" ON "letra" ("estilo_id");

CREATE UNIQUE INDEX "unique_palo_estilo" ON "palo_estilo" ("palo_id", "estilo_id");

CREATE INDEX "idx_palo_estilo_palo_id" ON "palo_estilo" ("palo_id");

CREATE INDEX "idx_palo_estilo_estilo_id" ON "palo_estilo" ("estilo_id");

CREATE UNIQUE INDEX "unique_artist_estilo" ON "artist_estilo" ("artist_id", "estilo_id");

CREATE INDEX "idx_artist_estilo_artist_id" ON "artist_estilo" ("artist_id");

CREATE INDEX "idx_artist_estilo_estilo_id" ON "artist_estilo" ("estilo_id");

CREATE UNIQUE INDEX "unique_palo_compas" ON "palo_compas" ("palo_id", "compas_id");

CREATE INDEX "idx_palo_compas_palo_id" ON "palo_compas" ("palo_id");

CREATE INDEX "idx_palo_compas_compas_id" ON "palo_compas" ("compas_id");

CREATE UNIQUE INDEX "unique_letra_artist" ON "letra_artist" ("letra_id", "artist_id");

CREATE INDEX "idx_letra_artist_letra_id" ON "letra_artist" ("letra_id");

CREATE INDEX "idx_letra_artist_artist_id" ON "letra_artist" ("artist_id");

CREATE UNIQUE INDEX "unique_letra_palo" ON "letra_palo" ("letra_id", "palo_id");

CREATE INDEX "idx_letra_palo_letra_id" ON "letra_palo" ("letra_id");

CREATE INDEX "idx_letra_palo_palo_id" ON "letra_palo" ("palo_id");

CREATE INDEX "idx_feedback_user_id" ON "feedback" ("user_id");

ALTER TABLE "palo" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "palo" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "estilo" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "estilo" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "artist" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "artist" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "compas" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "compas" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "letra" ADD FOREIGN KEY ("estilo_id") REFERENCES "estilo" ("id");

ALTER TABLE "letra" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "letra" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "palo_estilo" ADD FOREIGN KEY ("palo_id") REFERENCES "palo" ("id");

ALTER TABLE "palo_estilo" ADD FOREIGN KEY ("estilo_id") REFERENCES "estilo" ("id");

ALTER TABLE "palo_estilo" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "palo_estilo" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "artist_estilo" ADD FOREIGN KEY ("artist_id") REFERENCES "artist" ("id");

ALTER TABLE "artist_estilo" ADD FOREIGN KEY ("estilo_id") REFERENCES "estilo" ("id");

ALTER TABLE "artist_estilo" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "artist_estilo" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "palo_compas" ADD FOREIGN KEY ("palo_id") REFERENCES "palo" ("id");

ALTER TABLE "palo_compas" ADD FOREIGN KEY ("compas_id") REFERENCES "compas" ("id");

ALTER TABLE "palo_compas" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "palo_compas" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "letra_artist" ADD FOREIGN KEY ("letra_id") REFERENCES "letra" ("id");

ALTER TABLE "letra_artist" ADD FOREIGN KEY ("artist_id") REFERENCES "artist" ("id");

ALTER TABLE "letra_artist" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "letra_artist" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "letra_palo" ADD FOREIGN KEY ("letra_id") REFERENCES "letra" ("id");

ALTER TABLE "letra_palo" ADD FOREIGN KEY ("palo_id") REFERENCES "palo" ("id");

ALTER TABLE "letra_palo" ADD FOREIGN KEY ("user_create_id") REFERENCES "user" ("id");

ALTER TABLE "letra_palo" ADD FOREIGN KEY ("user_update_id") REFERENCES "user" ("id");

ALTER TABLE "feedback" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
