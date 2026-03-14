var currentPath = process.cwd();
var execSync = require('child_process').execSync,
os   = require('os'),
path = require('path');
var command_line = '';

var major_version=Number(process.version.match(/^v(\d+\.)/)[1])
//console.log(major_version);
var node_module_version= 0;
if (major_version==8) {
  node_module_version=57;
} else if (major_version==9) {
  node_module_version=59;
} else if (major_version==10) {
  node_module_version=64;
} else  {
  console.log("Unmmapped major_version="+major_version+ " Check https://nodejs.org/en/download/releases/ for the mapping value and update the preinstall script");
} 
var command = null
var shell = process.env.SHELL || 'sh';
var shellFlag = ' -c';
var scriptFile= 'node-sass/preinstall.sh'
//https://stackoverflow.com/questions/21557461/execute-a-batch-file-from-nodejs

if (os.platform() === 'win32' && process.env.SHELL === undefined) { 
  shell = process.env.COMSPEC || 'cmd.exe';
  shellFlag = '/c';
  scriptFile= 'node-sass\\preinstall.cmd'
}
  cmd = '"' + scriptFile + '" "' + currentPath +'" "' + process.platform +'" "' + process.arch +'" "' + node_module_version+ '"';

  // if cygwin on windows or linux then transform windows backslashes to forward slashes
  //if (path.sep === '\\' || path.sep === '/') {
  //  cmd = cmd.replace(/\\/g, '/');
  //}
  console.log(`Running ${cmd}`);
  try {
    var ouput = execSync(cmd)
    console.log(ouput.toString())
  } catch (error) {
    console.log(`exec error: ${error.message}`);
    console.log(`stderr: ${error.stderr}`);
    console.log(`stdout: ${error.stdout}`)
    return error.status;
  }