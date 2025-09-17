-- CreateEnum
CREATE TYPE "public"."ActivationCodeType" AS ENUM ('PREMIUM_MONTH', 'PREMIUM_YEAR', 'LIFETIME', 'TRIAL');

-- CreateEnum
CREATE TYPE "public"."ActivationCodeStatus" AS ENUM ('AVAILABLE', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MemoryStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."LearningStyleType" AS ENUM ('VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."PointTransactionType" AS ENUM ('REVIEW_COMPLETED', 'CHALLENGE_COMPLETED', 'ACHIEVEMENT_UNLOCKED', 'STREAK_BONUS', 'LEVEL_UP', 'MANUAL_ADJUST');

-- CreateEnum
CREATE TYPE "public"."ChallengeType" AS ENUM ('REVIEW_COUNT', 'REVIEW_ACCURACY', 'MEMORY_CREATED', 'STREAK_DAYS', 'CATEGORY_FOCUS');

-- CreateEnum
CREATE TYPE "public"."LeaderboardType" AS ENUM ('POINTS', 'LEVEL', 'STREAK', 'REVIEW_COUNT', 'ACCURACY');

-- CreateEnum
CREATE TYPE "public"."LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "public"."AchievementType" AS ENUM ('MILESTONE', 'PROGRESS', 'SPECIAL', 'HIDDEN');

-- CreateEnum
CREATE TYPE "public"."PointType" AS ENUM ('EARNED', 'SPENT', 'BONUS', 'PENALTY');

-- CreateEnum
CREATE TYPE "public"."UserBehaviorEventType" AS ENUM ('REVIEW_COMPLETED', 'MEMORY_CREATED', 'CATEGORY_FOCUS', 'TIME_SPENT', 'ACCURACY_HIGH', 'ACCURACY_LOW', 'STREAK_MAINTAINED', 'CHALLENGE_COMPLETED', 'ACHIEVEMENT_UNLOCKED', 'LEVEL_UP', 'POINTS_EARNED', 'UI_INTERACTION', 'THEME_CHANGED', 'CUSTOMIZATION');

-- CreateEnum
CREATE TYPE "public"."LearningContentType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'INTERACTIVE', 'QUIZ');

-- CreateEnum
CREATE TYPE "public"."ABTestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ABTestMetricType" AS ENUM ('ENGAGEMENT', 'RETENTION', 'CONVERSION', 'REVENUE', 'SATISFACTION', 'PERFORMANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."RewardCategory" AS ENUM ('VIRTUAL_GOODS', 'PHYSICAL_GOODS', 'DISCOUNT', 'PREMIUM_FEATURE', 'CUSTOMIZATION', 'BADGE', 'EXPERIENCE');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('ONE_TIME', 'RECURRING', 'PERMANENT', 'LIMITED');

-- CreateEnum
CREATE TYPE "public"."RewardStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'ADAPTIVE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('REMINDER', 'ACHIEVEMENT', 'CHALLENGE', 'STREAK', 'LEVEL_UP', 'POINTS_EARNED', 'DAILY_SUMMARY', 'WEEKLY_REPORT');

-- CreateEnum
CREATE TYPE "public"."NotificationMethod" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "public"."ThemeStyle" AS ENUM ('LIGHT', 'DARK', 'AUTO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."LearningStyleAdaptationStrategy" AS ENUM ('VISUAL_FOCUS', 'AUDITORY_FOCUS', 'KINESTHETIC_FOCUS', 'READING_FOCUS', 'BALANCED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activation_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."ActivationCodeType" NOT NULL,
    "status" "public"."ActivationCodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activation_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."memory_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'default',
    "tags" TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" "public"."MemoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "reviewTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "reviewScore" INTEGER,
    "notes" TEXT,
    "nextReviewAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "memoryContentId" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gamification_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamification_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_learning_styles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryStyle" "public"."LearningStyleType" NOT NULL,
    "secondaryStyle" "public"."LearningStyleType",
    "visualScore" INTEGER NOT NULL DEFAULT 0,
    "auditoryScore" INTEGER NOT NULL DEFAULT 0,
    "kinestheticScore" INTEGER NOT NULL DEFAULT 0,
    "readingScore" INTEGER NOT NULL DEFAULT 0,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_learning_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "type" "public"."AchievementType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."point_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."PointTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ChallengeType" NOT NULL,
    "target" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_daily_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "claimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leaderboards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."LeaderboardType" NOT NULL,
    "period" "public"."LeaderboardPeriod" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leaderboard_entries" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."PointType" NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ChallengeType" NOT NULL,
    "target" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_behavior_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "public"."UserBehaviorEventType" NOT NULL,
    "contentType" "public"."LearningContentType",
    "categoryId" TEXT,
    "timeSpent" INTEGER DEFAULT 0,
    "accuracy" DOUBLE PRECISION DEFAULT 0.0,
    "difficulty" INTEGER DEFAULT 1,
    "success" BOOLEAN DEFAULT false,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behavior_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetAudience" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_variants" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "trafficPercentage" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "isControl" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_metrics" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ABTestMetricType" NOT NULL,
    "formula" TEXT,
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "significance" BOOLEAN NOT NULL DEFAULT false,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_user_assignments" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "targetAudience" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_segment_users" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_segment_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reward_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" "public"."RewardCategory" NOT NULL,
    "type" "public"."RewardType" NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardItemId" TEXT NOT NULL,
    "status" "public"."RewardStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personalized_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "difficulty" JSONB,
    "notifications" JSONB,
    "theme" JSONB,
    "preferences" JSONB,
    "learningStyleAdaptation" JSONB,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personalized_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "activation_codes_code_key" ON "public"."activation_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gamification_profiles_userId_key" ON "public"."gamification_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_learning_styles_userId_key" ON "public"."user_learning_styles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "public"."user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_challenges_userId_challengeId_key" ON "public"."user_daily_challenges"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_leaderboardId_userId_key" ON "public"."leaderboard_entries"("leaderboardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_challenges_userId_challengeId_key" ON "public"."user_challenges"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "user_behavior_events_userId_timestamp_idx" ON "public"."user_behavior_events"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_results_testId_variantId_metricId_key" ON "public"."ab_test_results"("testId", "variantId", "metricId");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_user_assignments_testId_userId_key" ON "public"."ab_test_user_assignments"("testId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ab_segment_users_segmentId_userId_key" ON "public"."ab_segment_users"("segmentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_rewards_userId_rewardItemId_key" ON "public"."user_rewards"("userId", "rewardItemId");

-- CreateIndex
CREATE UNIQUE INDEX "personalized_configs_userId_key" ON "public"."personalized_configs"("userId");

-- AddForeignKey
ALTER TABLE "public"."activation_codes" ADD CONSTRAINT "activation_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."memory_contents" ADD CONSTRAINT "memory_contents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_memoryContentId_fkey" FOREIGN KEY ("memoryContentId") REFERENCES "public"."memory_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gamification_profiles" ADD CONSTRAINT "gamification_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_learning_styles" ADD CONSTRAINT "user_learning_styles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."gamification_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_profile_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."gamification_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_transactions" ADD CONSTRAINT "point_transactions_profile_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."gamification_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_daily_challenges" ADD CONSTRAINT "user_daily_challenges_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_daily_challenges" ADD CONSTRAINT "user_daily_challenges_challenge_id_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."daily_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_daily_challenges" ADD CONSTRAINT "user_daily_challenges_profile_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."gamification_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_leaderboard_id_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "public"."leaderboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_profile_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."gamification_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."points" ADD CONSTRAINT "points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_challenges" ADD CONSTRAINT "user_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_challenges" ADD CONSTRAINT "user_challenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_behavior_events" ADD CONSTRAINT "user_behavior_events_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_variants" ADD CONSTRAINT "ab_test_variants_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_metrics" ADD CONSTRAINT "ab_test_metrics_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_results" ADD CONSTRAINT "ab_test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_results" ADD CONSTRAINT "ab_test_results_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ab_test_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_results" ADD CONSTRAINT "ab_test_results_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "public"."ab_test_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_user_assignments" ADD CONSTRAINT "ab_test_user_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_user_assignments" ADD CONSTRAINT "ab_test_user_assignments_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ab_test_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_user_assignments" ADD CONSTRAINT "ab_test_user_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_templates" ADD CONSTRAINT "ab_test_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_segments" ADD CONSTRAINT "ab_segments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_segment_users" ADD CONSTRAINT "ab_segment_users_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "public"."ab_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_segment_users" ADD CONSTRAINT "ab_segment_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_rewards" ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_rewards" ADD CONSTRAINT "user_rewards_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "public"."reward_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personalized_configs" ADD CONSTRAINT "personalized_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
