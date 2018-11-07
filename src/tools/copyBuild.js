const fs = require('fs-extra');
const chalk = require('chalk');

try {
  fs.emptyDirSync('docs/app');
  fs.emptyDirSync('docs/demo');

  fs.copySync('build', 'docs/app');
  fs.copySync('build/config-app/appversion.json', 'docs/app/appversion.json');
  fs.copySync('build', 'docs/demo');
  fs.copySync('build/config-demo/appversion.json', 'docs/demo/appversion.json');

  fs.removeSync('docs/app/config-app');
  fs.removeSync('docs/app/config-demo');
  fs.removeSync('docs/demo/config-app');
  fs.removeSync('docs/demo/config-demo');

  console.log(chalk.green("Build of app and demo successful. All files are ready for commit and push!"));
} catch (err) {
  console.error(err);
}
  