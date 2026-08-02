@echo off

call npx prisma generate

npx prisma db push