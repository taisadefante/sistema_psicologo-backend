-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'presencial';
