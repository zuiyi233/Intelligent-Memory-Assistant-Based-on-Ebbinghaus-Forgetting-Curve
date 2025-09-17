-- CreateEnum
CREATE TYPE "public"."TutorialCategory" AS ENUM ('BASICS', 'ADVANCED', 'FEATURES', 'ACHIEVEMENTS', 'REWARDS', 'CHALLENGES');

-- CreateEnum
CREATE TYPE "public"."TutorialAudience" AS ENUM ('NEW_USER', 'RETURNING_USER', 'POWER_USER');

-- CreateEnum
CREATE TYPE "public"."TutorialStepType" AS ENUM ('INFO', 'INTERACTION', 'NAVIGATION', 'DEMONSTRATION');

-- CreateEnum
CREATE TYPE "public"."TutorialProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."StepProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."social_shares" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "shareText" TEXT NOT NULL,
    "shareImage" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tutorials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."TutorialCategory" NOT NULL,
    "audience" "public"."TutorialAudience" NOT NULL,
    "difficulty" "public"."DifficultyLevel" NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "prerequisites" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tutorial_steps" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."TutorialStepType" NOT NULL,
    "position" TEXT NOT NULL,
    "target" TEXT,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "points" INTEGER NOT NULL DEFAULT 0,
    "actions" JSONB,
    "metadata" JSONB,

    CONSTRAINT "tutorial_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tutorial_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "status" "public"."TutorialProgressStatus" NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "user_tutorial_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_step_progress" (
    "id" TEXT NOT NULL,
    "userProgressId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "public"."StepProgressStatus" NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "user_step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tutorial_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "helpful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutorial_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_shares_userId_sharedAt_idx" ON "public"."social_shares"("userId", "sharedAt");

-- CreateIndex
CREATE INDEX "tutorial_steps_tutorialId_order_idx" ON "public"."tutorial_steps"("tutorialId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "user_tutorial_progress_userId_tutorialId_key" ON "public"."user_tutorial_progress"("userId", "tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "user_step_progress_userProgressId_stepId_key" ON "public"."user_step_progress"("userProgressId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_feedback_userId_tutorialId_key" ON "public"."tutorial_feedback"("userId", "tutorialId");

-- AddForeignKey
ALTER TABLE "public"."social_shares" ADD CONSTRAINT "social_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutorial_steps" ADD CONSTRAINT "tutorial_steps_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_step_progress" ADD CONSTRAINT "user_step_progress_userProgressId_fkey" FOREIGN KEY ("userProgressId") REFERENCES "public"."user_tutorial_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_step_progress" ADD CONSTRAINT "user_step_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."tutorial_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutorial_feedback" ADD CONSTRAINT "tutorial_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutorial_feedback" ADD CONSTRAINT "tutorial_feedback_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
