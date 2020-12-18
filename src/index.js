#!/usr/bin/env node

const cli = require('./cli')
const config = require('./config')
const git = require('./git')

const command = process.argv[2]

const ShareBranchPrefix = 'share'

async function run() {
  await promptAndInstallAliasIfNeeded()

  if (!command || command === 'share') {
    await share()
  } else if (command === 'take') {
    await take()
  } else {
    throw new Error(`Invalid command: "${command}". Must be "share" or "take".`)
  }
}

async function share() {
  if (await git.isRepoClean()) {
    console.log('\n🤨 No changes to share\n')
    return
  }

  const originalBranch = await git.getCurrentBranchName()
  const newShareBranch = generateShareBranchName()

  console.log(`Checking out new branch: "${newShareBranch}"`)
  await git.checkoutLocalBranch(newShareBranch)

  console.log('Adding all changes')
  await git.addAllChanges()

  console.log('Committing')
  await git.commitNoVerify('💙 Sharing')

  console.log('Pushing')
  await git.push(newShareBranch)

  console.log(`Checking out "${originalBranch}"`)
  await git.checkout(originalBranch)

  console.log(`Deleting local share branch "${newShareBranch}"`)
  await git.deleteLocalBranch(newShareBranch)

  console.log(`\n🤝 Shared branch: "${newShareBranch}"\n`)
}

function generateShareBranchName() {
  const randomNumber = Math.round(Math.random() * 1000)
  return `${ShareBranchPrefix}/${randomNumber}`
}

async function take() {
  await updateBranches()

  const branchName = await getSelectedBranchName()
  if (!branchName) {
    console.log(`\n😢  No sharing branches found\n`)
    return
  }

  console.log('Merging share branch')
  await git.mergeFromTo(branchName, 'master')

  console.log('Resetting changes into working tree')
  await git.resetLastCommitIntoWorkingTree()


  console.log('Adding changes to index')
  await git.addAllChanges()

  const shortBranchName = branchName.replace('origin/', '')
  console.log(`Deleting remote branch "${shortBranchName}"`)
  await git.deleteRemoteBranch(shortBranchName)

  console.log(`\n🤝 Changes fetched from shared branch "${shortBranchName}"\n`)
}

async function updateBranches() {
  if (await git.isTrackingARemoteBranch()) {
    console.log('Pulling')
    await git.pull()
  } else {
    console.log('Fetching sharing branches')
    await git.fetchBranchesStartingWith(ShareBranchPrefix)
  }
}

async function getSelectedBranchName() {
  const branchNames = await git.getAllBranchNamesStartingWith(ShareBranchPrefix)

  if (branchNames.length === 0)
    return null

  if (branchNames.length === 1)
    return branchNames[0]

  return cli.promptForBranchName(await getBranchChoices(branchNames))
}

async function getBranchChoices(branchNames) {
  const choices = await Promise.all(branchNames.map(getBranchChoice))

  return choices.sort((a, b) => b.date - a.date)
}

async function getBranchChoice(fullBranchName) {
  const branch = await git.getBranchInfo(fullBranchName)
  const formattedDate = branch.date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })

  return {
    name: `"${branch.name}" - by ${branch.author} - on ${formattedDate}`,
    value: fullBranchName,
    date: branch.date
  }
}

async function promptAndInstallAliasIfNeeded() {
  const executingPath = process.env._

  if (!executingPath.endsWith('npx') || config.get('skipAliasCheck') || await git.getConfigAlias('share'))
    return

  if (await cli.promptForShouldInstallGitAliases()) {
    await installGitAliases()
  } else  {
    config.set('skipAliasCheck', true)
  }
}

async function installGitAliases() {
  await git.addConfigAlias('share', '!npx git-share share')
  await git.addConfigAlias('take', '!npx git-share take')

  console.log('🤩 Success! Now you can share your changes with ✨git share✨ and get changes from others with ✨git take✨!')
}


run()
  .catch(err => console.error(err))

