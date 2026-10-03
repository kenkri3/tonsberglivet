-- BASELINE for Tønsberglivet — GENERERT, ikke rediger for hånd.
--
-- Kilden er prisma/schema.prisma. Vil du endre noe her, endre skjemaet og kjør
-- `npm run db:baseline`, som genererer denne filen på nytt.
--
-- Filen er med vilje IDEMPOTENT: hver setning tåler at objektet allerede finnes.
-- Grunnen er at produksjonsdatabasen ble satt opp med `prisma db push` før
-- migrasjoner fantes. Den har derfor ingen _prisma_migrations, og
-- `prisma migrate deploy` nekter å kjøre (P3005 «database schema is not empty»).
-- I tillegg manglet den tabeller som skjemaet krevde – bl.a. "BookingRequest",
-- som gjorde at agentens verktøy feilet lenge uten at noe så det.
--
-- Med denne filen kan `node scripts/ensure-schema.mjs` kjøre på hver deploy og
-- bringe databasen i synk: den oppretter det som mangler og rører ingenting som
-- finnes. Data går aldri tapt.
--
-- Den ligger også i prisma/migrations/ slik at Prisma kan overta vanlig
-- migrasjonsdrift senere (se scripts/ensure-schema.mjs).

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ArticleCategory" AS ENUM ('BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "EventCategory" AS ENUM ('ARRANGEMENT', 'KONSERT', 'MARKED', 'KURS', 'BARN', 'SPORT', 'KULTUR', 'FESTIVAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BusinessCategory" AS ENUM ('SHOPPING', 'MAT_DRIKKE', 'AKTIVITET', 'OVERNATTING', 'FRISOR_VELVERE', 'KULTUR', 'BARN', 'ANNET');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BusinessArea" AS ENUM ('TONSBERG_SENTRUM', 'TONSBERG_KOMMUNE', 'FAERDER_KOMMUNE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PartnerLevel" AS ENUM ('PREMIUM', 'STANDARD', 'BASIC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'UPCOMING');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "GdprStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BookingType" AS ENUM ('DAGPLASS', 'SESONG', 'HELAAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'PROCESSING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "title" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "ArticleCategory" NOT NULL DEFAULT 'BYLIVET',
    "authorId" TEXT,
    "imageId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "address" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "EventCategory" NOT NULL DEFAULT 'ARRANGEMENT',
    "imageId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "openingHours" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "BusinessCategory" NOT NULL DEFAULT 'ANNET',
    "area" "BusinessArea" NOT NULL DEFAULT 'TONSBERG_SENTRUM',
    "logoId" TEXT,
    "imageId" TEXT,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "level" "PartnerLevel" NOT NULL DEFAULT 'STANDARD',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoId" TEXT,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "filename" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "sizeBytes" INTEGER,
    "photographer" TEXT,
    "gdprStatus" "GdprStatus" NOT NULL DEFAULT 'PENDING',
    "gdprNotes" TEXT,
    "tags" TEXT[],
    "aiTags" TEXT[],
    "location" TEXT,
    "season" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ImageFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BookingRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" "BookingType" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "zone" TEXT,
    "powerNeeded" BOOLEAN NOT NULL DEFAULT false,
    "waterNeeded" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" DOUBLE PRECISION,
    "orgNr" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PartnerApplication" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_vacancies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "city" TEXT,
    "engagementType" TEXT,
    "extent" TEXT,
    "applicationDeadline" TEXT,
    "published" TIMESTAMP(3),
    "expires" TIMESTAMP(3),
    "link" TEXT NOT NULL,
    "applicationUrl" TEXT,
    "isStudentFriendly" BOOLEAN NOT NULL DEFAULT false,
    "descriptionSnippet" TEXT,
    "sector" TEXT,
    "navStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "navUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeamTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InternalNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Article_published_publishedAt_idx" ON "Article"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_published_idx" ON "Event"("published");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Business_category_idx" ON "Business"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Business_area_idx" ON "Business"("area");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Business_published_idx" ON "Business"("published");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Partner_level_idx" ON "Partner"("level");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Partner_published_idx" ON "Partner"("published");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Image_tags_idx" ON "Image"("tags");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Image_folderId_idx" ON "Image"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ImageFolder_name_parentId_key" ON "ImageFolder"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_vacancies_navStatus_municipality_idx" ON "job_vacancies"("navStatus", "municipality");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_vacancies_expires_idx" ON "job_vacancies"("expires");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamTask_status_idx" ON "TeamTask"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamTask_assignedToId_idx" ON "TeamTask"("assignedToId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InternalNote_createdAt_idx" ON "InternalNote"("createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Event" ADD CONSTRAINT "Event_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Business" ADD CONSTRAINT "Business_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Business" ADD CONSTRAINT "Business_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Partner" ADD CONSTRAINT "Partner_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Image" ADD CONSTRAINT "Image_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ImageFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ImageFolder" ADD CONSTRAINT "ImageFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ImageFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

