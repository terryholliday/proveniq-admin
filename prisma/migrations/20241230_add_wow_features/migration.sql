-- WOW Features Migration: Tasks, Notifications, Close Plans, Proof Packs, Email Logs
-- Run this migration when database is available: npx prisma migrate deploy

-- Create new enums
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TaskType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'PROPOSAL', 'CONTRACT', 'OTHER');
CREATE TYPE "NotificationType" AS ENUM ('TASK_DUE', 'DEAL_UPDATE', 'DEAL_AT_RISK', 'STAGE_CHANGE', 'SYSTEM', 'REMINDER');
CREATE TYPE "ClosePlanItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED', 'SKIPPED');

-- Create Task table
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'OTHER',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT,
    "closePlanItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- Create Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dealId" TEXT,
    "taskId" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create DealClosePlan table
CREATE TABLE "DealClosePlan" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "targetCloseDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskSummary" TEXT,
    "recommendedActions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealClosePlan_pkey" PRIMARY KEY ("id")
);

-- Create ClosePlanItem table
CREATE TABLE "ClosePlanItem" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "closePlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "ClosePlanItemStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosePlanItem_pkey" PRIMARY KEY ("id")
);

-- Create ProofPack table
CREATE TABLE "ProofPack" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,
    "dealName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "dealValue" BIGINT,
    "stage" TEXT NOT NULL,
    "closeDate" TIMESTAMP(3),
    "meddpiccSnapshot" JSONB,
    "stakeholderSnapshot" JSONB,
    "activitySummary" JSONB,
    "winProbability" INTEGER,
    "driScore" INTEGER,
    "driState" TEXT,
    "executiveSummary" TEXT,
    "exportFormat" TEXT,
    "exportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofPack_pkey" PRIMARY KEY ("id")
);

-- Create EmailLog table
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT,
    "contactId" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "toAddresses" TEXT[],
    "ccAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fromAddress" TEXT,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "threadId" TEXT,
    "messageId" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for DealClosePlan
CREATE UNIQUE INDEX "DealClosePlan_dealId_key" ON "DealClosePlan"("dealId");

-- Create indexes for Task
CREATE INDEX "Task_orgId_status_idx" ON "Task"("orgId", "status");
CREATE INDEX "Task_orgId_assignedToId_idx" ON "Task"("orgId", "assignedToId");
CREATE INDEX "Task_orgId_dueDate_idx" ON "Task"("orgId", "dueDate");
CREATE INDEX "Task_orgId_dealId_idx" ON "Task"("orgId", "dealId");

-- Create indexes for Notification
CREATE INDEX "Notification_orgId_userId_read_idx" ON "Notification"("orgId", "userId", "read");
CREATE INDEX "Notification_orgId_userId_createdAt_idx" ON "Notification"("orgId", "userId", "createdAt");

-- Create indexes for ClosePlanItem
CREATE INDEX "ClosePlanItem_orgId_closePlanId_idx" ON "ClosePlanItem"("orgId", "closePlanId");
CREATE INDEX "ClosePlanItem_orgId_status_idx" ON "ClosePlanItem"("orgId", "status");

-- Create indexes for ProofPack
CREATE INDEX "ProofPack_orgId_dealId_idx" ON "ProofPack"("orgId", "dealId");
CREATE INDEX "ProofPack_orgId_generatedAt_idx" ON "ProofPack"("orgId", "generatedAt");

-- Create indexes for EmailLog
CREATE INDEX "EmailLog_orgId_dealId_idx" ON "EmailLog"("orgId", "dealId");
CREATE INDEX "EmailLog_orgId_contactId_idx" ON "EmailLog"("orgId", "contactId");
CREATE INDEX "EmailLog_orgId_sentAt_idx" ON "EmailLog"("orgId", "sentAt");

-- Add foreign keys for Task
ALTER TABLE "Task" ADD CONSTRAINT "Task_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_closePlanItemId_fkey" FOREIGN KEY ("closePlanItemId") REFERENCES "ClosePlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign keys for Notification
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for DealClosePlan
ALTER TABLE "DealClosePlan" ADD CONSTRAINT "DealClosePlan_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DealClosePlan" ADD CONSTRAINT "DealClosePlan_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for ClosePlanItem
ALTER TABLE "ClosePlanItem" ADD CONSTRAINT "ClosePlanItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClosePlanItem" ADD CONSTRAINT "ClosePlanItem_closePlanId_fkey" FOREIGN KEY ("closePlanId") REFERENCES "DealClosePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClosePlanItem" ADD CONSTRAINT "ClosePlanItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign keys for ProofPack
ALTER TABLE "ProofPack" ADD CONSTRAINT "ProofPack_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProofPack" ADD CONSTRAINT "ProofPack_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProofPack" ADD CONSTRAINT "ProofPack_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign keys for EmailLog
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
