@echo off

call npm install

pushd "databases\prod\prisma"
	call "apply changes.bat"
popd

cd "databases\test\prisma"
"apply changes.bat"

pause