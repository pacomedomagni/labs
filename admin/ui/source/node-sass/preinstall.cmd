@echo off
echo "***** Running preinstall ****************"
set currentPath=%~1
set process_platform=%~2
set process_arch=%~3
set node_module_version=%~4
set binary_file_path=%currentPath%\node-sass\%process_platform%-%process_arch%-%node_module_version%_binding.node
set vendor_path=%currentPath%\node_modules\node-sass\vendor\%process_platform%-%process_arch%-%node_module_version%
set vendor_file_path=%vendor_path%\binding.node

IF EXIST %currentPath%/node_modules/node-sass (
    echo "***** Node-sass already installed ****************"
) ELSE (
    echo "***** Preinstalling Node-sass****************"
    REM TFS seems to be parsing the output of npm to determinate if the job completes
    REM it is stopping the execution too early. Output has been redirected to null > nul 2>&1
    start /B /WAIT C:\PROGRA~1\nodejs\npm install node-sass@^4.11.0 --sass-binary-path=%binary_file_path%  || goto :error
)

IF EXIST %vendor_path% (
    echo "***** vendor folder available ****************"
) ELSE (
    echo "***** creating vendor folder ****************"
     mkdir %vendor_path%
)
echo "***** Copying %binary_file_path% to %vendor_file_path% ****************"
copy %binary_file_path% %vendor_file_path%
goto :EOF


:error
echo Failed with error #%errorlevel%.
exit /b %errorlevel%