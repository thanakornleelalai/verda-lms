-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "InstructorApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "courseIdea" TEXT NOT NULL,
    "linkedIn" TEXT,
    "website" TEXT,
    "portfolio" TEXT,
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstructorApplication_userId_key" ON "InstructorApplication"("userId");

-- AddForeignKey
ALTER TABLE "InstructorApplication" ADD CONSTRAINT "InstructorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
