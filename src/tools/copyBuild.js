const fs = require('fs-extra');
const chalk = require('chalk');

fs.emptyDirSync('docs/app');

fs.copy('build', 'docs/app', err => {
  if (err) {
    return console.log(err); 
  }
  console.log(chalk.green("Build successful. All files are ready for commit and push!"));
});
