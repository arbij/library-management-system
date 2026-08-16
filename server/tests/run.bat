@echo off

@REM title %~n0
title tests

cls

pushd "../../databases/test/reset"
	call run.bat
popd

node .mjs

pause