@echo off

title %~n0

cls

set "database=file:./databases/test/.db"
set "admin_password=admin"
set "testing=true"

run.bat