#!/bin/bash
set -e
echo "*********************"
currentPath=$1
process_platform=$2
process_arch=$3
node_module_version=$4

binary_file_path=${currentPath}/node-sass/${process_platform}-${process_arch}-${node_module_version}_binding.node
vendor_path=${currentPath}/node_modules/node-sass/vendor/${process_platform}-${process_arch}-${node_module_version}
vendor_file_path=$vendor_path/binding.node
echo "***** Preinstalling Node-sass****************"
if [ -d  ${currentPath}/node_modules/node-sass ]
then
    echo "Node-sass already installed"
else
    npm install node-sass@^4.11.0 --sass-binary-path=$binary_file_path
fi
mkdir -p $vendor_path
echo "***** Copying $binary_file_path to $vendor_file_path ****************"
cp $binary_file_path $vendor_file_path