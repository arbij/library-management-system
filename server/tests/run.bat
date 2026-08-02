@echo off

cls

pushd "../../databases/test/reset"
	call run.bat
popd

node .mjs