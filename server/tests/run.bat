@echo off

title %~n0

cls

pushd "../../databases/test/reset"
	call run.bat
popd

node .mjs

pause