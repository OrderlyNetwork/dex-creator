-- AlterTable
ALTER TABLE "Dex" ADD COLUMN     "graduatedAt" TIMESTAMP(3),
ADD COLUMN     "telegramGroupId" TEXT,
ADD COLUMN     "telegramInviteLink" TEXT,
ALTER COLUMN "makerFee" DROP DEFAULT,
ALTER COLUMN "takerFee" DROP DEFAULT;
