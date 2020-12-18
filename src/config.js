const fs = require('fs')
const path = require('path')

function get(name) {
  return getAllConfig()[name]
}

function set(name, value) {
  const allConfig = getAllConfig()
  allConfig[name] = value

  const allConfigDataStr = JSON.stringify(allConfig)

  fs.writeFileSync(getConfigFilePath(), allConfigDataStr, { flag: 'w' })
}

function getAllConfig() {
  const configDataStr = fs.readFileSync(getConfigFilePath(), 'utf8')
  return configDataStr ? JSON.parse(configDataStr) : {}
}

function getConfigFilePath() {
  const appDataPath = process.env.APPDATA || (
    process.platform == 'darwin'
      ? path.join(process.env.HOME, 'Library', 'Preferences')
      : path.join(process.env.HOME, '.local', 'share')
  )
  const appConfigDir = path.join(appDataPath, 'git-share')

  if (!fs.existsSync(appConfigDir))
    fs.mkdirSync(appConfigDir, { recursive: true })

  const appConfigPath = path.join(appConfigDir, 'config.json')
  if (!fs.existsSync(appConfigPath))
    fs.writeFileSync(appConfigPath, '{}', { flag: 'w' })

  return path.join(appDataPath, 'git-share/config.json')
}

module.exports = {
  get,
  set
}
