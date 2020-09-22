#!/usr/bin/env node

const git = require('simple-git')()
const inquirer = require('inquirer')

const command = process.argv[2]

const ShareBranchPrefix = 'share'

async function run() {
  if (!command || command === 'share') {
    await index()
  } else if (command === 'take') {
    await take()
  } else {
    throw new Error(`Invalid command: "${command}". Must be null/"share" or "take".`)
  }
}

async function index() {
  const status = await git.status()
  if (status.isClean()) {
    console.log('\n🤨 No changes to share\n')
    return
  }

  const originalBranchName = status.current

  const branchName = generateShareBranchName()
  console.log(`Checking out new branch: "${branchName}"`)
  await git.checkoutLocalBranch(branchName)

  console.log('Adding all changes')
  await git.raw('add', '-A')

  console.log('Committing')
  await git.commit('Sharing 💙')

  console.log('Pushing')
  await git.push('origin', branchName, { '--set-upstream': null })

  console.log(`Checking out "${originalBranchName}"`)
  await git.checkout(originalBranchName)

  console.log(`Deleting local share branch "${branchName}"`)
  await git.deleteLocalBranch(branchName)

  console.log(`\n🤝 Shared branch: "${branchName}"\n`)
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
  await git.reset(['HEAD^'])


  console.log('Adding changes to index')
  await git.raw('add', '-A')

  const shortBranchName = branchName.replace('origin/', '')
  console.log(`Deleting remote branch "${shortBranchName}"`)
  await git.push('origin', shortBranchName, {'--delete': null })

  console.log(`\n🤝 Changes fetched from shared branch "${shortBranchName}"\n`)
}

async function updateBranches() {
  const status = await git.status()

  const isTrackingARemoteBranch = !!status.tracking
  if (isTrackingARemoteBranch) {
    console.log('Pulling')
    await git.pull()
  } else {
    console.log('Fetching sharing branches')
    await git.fetch('origin', `refs/heads/${ShareBranchPrefix}/*:refs/remotes/origin/${ShareBranchPrefix}/*`)
  }
}

async function getSelectedBranchName() {
  const { all: branchNames } = await git.branch(['--remotes', '--list' , `origin/${ShareBranchPrefix}/*`])

  if (branchNames.length === 0)
    return null

  if (branchNames.length === 1)
    return branchNames[0]

  const { branchName } = await inquirer.prompt([{
    name: 'branchName',
    message: 'Which share branch?',
    type: 'list',
    choices: await getBranchChoices(branchNames)
  }])

  return branchName
}

async function getBranchChoices(branchNames) {
  const choices = await Promise.all(branchNames.map(getBranchChoice))

  return choices.sort((a, b) => b.date - a.date)
}

async function getBranchChoice(fullBranchName) {
  const info = await git.show(fullBranchName)

  const [infoLine, authorLine, dateLine] = info.split('\n')
  const branchName = fullBranchName.replace('origin/', '')
  const author = authorLine.split(/:\s+/)[1].split(' ')[0]
  const date = new Date(dateLine.split(/:\s+/)[1])
  const formattedDate = date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })

  return {
    name: `"${branchName}" - by ${author} - on ${formattedDate}`,
    value: fullBranchName,
    date
  }
}


run()
  .catch(err => console.error(err))

