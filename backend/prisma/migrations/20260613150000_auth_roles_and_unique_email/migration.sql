-- Replace the initial role set with the roles used by the authentication MVP.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'USER');

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING ("role"::text::"UserRole_new");

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- Authentication identifies users globally by email.
DROP INDEX "User_businessId_email_key";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
