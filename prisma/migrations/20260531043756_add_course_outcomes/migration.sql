-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[];
