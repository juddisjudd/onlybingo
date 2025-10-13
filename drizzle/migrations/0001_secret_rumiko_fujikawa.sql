-- Truncate existing data (development only) and alter column
TRUNCATE TABLE "boards";
ALTER TABLE "boards" ALTER COLUMN "id" SET DATA TYPE varchar(10);
