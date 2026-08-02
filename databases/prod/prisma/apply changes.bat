@echo off

cls

call npx prisma generate

npx prisma db push