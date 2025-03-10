/*
  Warnings:

  - You are about to drop the column `link` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "link",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "createdAt",
ALTER COLUMN "status" SET DEFAULT 'A Pagar';
