const fs = require('fs-extra');
const chalk = require('chalk');

fs.emptyDirSync('docs/app');

fs.copy('build', 'docs/app', err => {
  if (err) return console.log(err); // eslint-disable-line no-console
  console.log(chalk.green("Build successful. All files are ready for commit and push!")); // eslint-disable-line no-console
});
