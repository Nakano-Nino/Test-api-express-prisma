/*
  Warnings:

  - A unique constraint covering the columns `[email,phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- DropIndex
DROP INDEX `User_phone_key` ON `user`;

-- AlterTable
ALTER TABLE `user` MODIFY `firstName` VARCHAR(255) NOT NULL,
    MODIFY `lastName` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_phone_key` ON `User`(`email`, `phone`);
