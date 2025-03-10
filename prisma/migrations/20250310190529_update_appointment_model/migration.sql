-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'presencial';
