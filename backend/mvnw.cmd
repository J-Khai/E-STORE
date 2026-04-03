@echo off
setlocal enabledelayedexpansion

rem ------------------------------------------------------------
rem Maven Wrapper for Windows
rem ------------------------------------------------------------

set "MVNW_REPOURL=https://repo.maven.apache.org/maven2"
set "MVNW_VERSION=3.9.8"
set "MVNW_DIR=%~dp0\.mvn\wrapper"

if not exist "%MVNW_DIR%\maven-wrapper.jar" (
    echo Downloading Maven Wrapper JAR ...
    powershell -Command "Invoke-WebRequest -Uri %MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/0.5.7/maven-wrapper-0.5.7.jar -OutFile \"%MVNW_DIR%\maven-wrapper.jar\""
)

java -jar "%MVNW_DIR%\maven-wrapper.jar" %*
