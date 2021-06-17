import { join } from 'path'

import { info, setFailed, addPath } from '@actions/core'
import { find, downloadTool, extractTar, cacheDir } from '@actions/tool-cache'
import { exec } from '@actions/exec'

const name = 'fazz-ecr'
const version = 'v0.1.0'
const url = `https://github.com/payfazz/${name}/releases/download/${version}/${name}-${version}-linux-x64.tar.gz`

const main = async () => {
  if (process.platform != 'linux') {
    throw new Error('only support linux')
  }

  let toolPath = find(name, version)
  if (toolPath) {
    info(`Found in cache @  ${toolPath}`)
  } else {
    info(`Attempting to donwload ${url}`)
    const downloadPath = await downloadTool(url)
    const extractPath = await extractTar(downloadPath)
    info(`Succesfully extracted to ${extractPath}`)
    toolPath = await cacheDir(extractPath, name, version)
    info(`Successfully cached to ${toolPath}`);
  }

  const exitCode = await exec(join(toolPath, 'docker-credential-fazz-ecr'), ['update-config'])
  if (exitCode != 0) {
    throw new Error('cannot update docker config')
  }
  addPath(toolPath)
  info(`Successfully setup ${name} version ${version}`)
}

main().catch(setFailed)
