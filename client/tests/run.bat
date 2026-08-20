@echo off

pushd "../../databases/test/reset"
	call run.bat
popd

start "" "http://localhost:5001/client tests"