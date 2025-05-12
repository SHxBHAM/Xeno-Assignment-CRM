/*
  Warnings:

  - The values [DRAFT,SENDING,FAILED] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `scheduledAt` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampaignStatus_new" AS ENUM ('PROCESSING', 'COMPLETED');
ALTER TABLE "Campaign" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Campaign" ALTER COLUMN "status" TYPE "CampaignStatus_new" USING ("status"::text::"CampaignStatus_new");
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
ALTER TYPE "CampaignStatus_new" RENAME TO "CampaignStatus";
DROP TYPE "CampaignStatus_old";
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
COMMIT;

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "scheduledAt",
ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
