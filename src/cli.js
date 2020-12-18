const inquirer = require('inquirer')

async function promptForShouldInstallGitAliases() {
  const result = await inquirer.prompt({
    name: 'installGitAliases',
    message: 'Install git aliases "git share" and "git take"?',
    type: 'confirm',
  })

  return result.installGitAliases
}

async function promptForBranchName(choices) {
  const result = await inquirer.prompt([{
    name: 'branchName',
    message: 'Which share branch?',
    type: 'list',
    choices
  }])

  return result.branchName
}

module.exports = {
  promptForShouldInstallGitAliases,
  promptForBranchName
}
