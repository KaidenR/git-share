const git = require('simple-git')()

git.env({
  HUSKY_SKIP_HOOKS: 1
})

module.exports = {
  checkoutLocalBranch: git.checkoutLocalBranch.bind(git),
  checkout: git.checkout.bind(git),
  deleteLocalBranch: git.deleteLocalBranch.bind(git),
  mergeFromTo: git.mergeFromTo.bind(git),
  pull: git.pull.bind(git),

  async isRepoClean() {
    const status = await git.status()
    return status.isClean()
  },

  async getCurrentBranchName() {
    const status = await git.status()
    return status.current
  },

  async addAllChanges(){
    await git.raw('add', '-A')
  },

  async commitNoVerify(message) {
    await git.raw('commit', '--no-verify', '-m', message)
  },

  async push(branchName) {
    await git.push('origin', branchName, { '--set-upstream': null })
  },

  async addConfigAlias(name, value) {
    await git.raw('config', '--global', `alias.${name}`, value)
  },

  async getConfigAlias(name) {
    return git.raw('config', '--global', `alias.${name}`)
  },

  async resetLastCommitIntoWorkingTree() {
    await git.reset(['HEAD^'])
  },

  async deleteRemoteBranch(branchName) {
    await git.push('origin', branchName, {'--delete': null })
  },

  async isTrackingARemoteBranch() {
    const status = await git.status()
   return !!status.tracking
  },

  async fetchBranchesStartingWith(prefix) {
    await git.fetch('origin', `refs/heads/${prefix}/*:refs/remotes/origin/${prefix}/*`)
  },

  async getAllBranchNamesStartingWith(prefix) {
    const result = await git.branch(['--remotes', '--list' , `origin/${prefix}/*`])
    return result.all
  },

  async getBranchInfo(branchName) {
    let showResults = await git.show(branchName)
    if (typeof showResults === 'string')
      showResults = showResults.split('\n')

    const [infoLine, authorLine = '', dateLine] = showResults

    const date = new Date(dateLine.split(/:\s+/)[1])

    return {
      name: branchName.replace('origin/', ''),
      author: authorLine.split(/:\s+/)[1].split(' ')[0],
      date
    }
  }
}
