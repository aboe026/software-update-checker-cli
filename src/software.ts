import fetch from 'node-fetch'
import { ExecOptions } from 'child_process'
import path from 'path'

import { Dynamic, Static, isStatic, getDynamicExecutable } from './executable'
import execute from './execute-async'

export default class Software {
  readonly name: string
  readonly executable: Dynamic | Static
  readonly args?: string
  readonly shellOverride?: string
  readonly installedRegex: string
  readonly url: string
  readonly latestRegex: string

  constructor({
    name,
    executable,
    args,
    shellOverride,
    installedRegex,
    url,
    latestRegex,
  }: {
    name: string
    executable: Dynamic | Static
    args?: string
    shellOverride?: string
    installedRegex: string
    url: string
    latestRegex: string
  }) {
    if (name === '') {
      throw Error('Name must be non-empty')
    }
    this.name = name
    this.executable = executable
    this.args = args
    this.shellOverride = shellOverride
    this.installedRegex = installedRegex
    this.url = url
    this.latestRegex = latestRegex
  }

  async getInstalledVersion(): Promise<string | null> {
    const executable = await getExecutable(this.executable)
    const output = await getFromExecutable({
      directory: path.dirname(executable),
      command: path.basename(executable),
      args: this.args,
      shellOverride: this.shellOverride,
    })
    return getFromRegex(output, new RegExp(this.installedRegex))
  }

  async getLatestVersion(): Promise<string | null> {
    const response = await getFromUrl(this.url)
    return getFromRegex(response, new RegExp(this.latestRegex))
  }
}

export async function getExecutable(executable: Static | Dynamic): Promise<string> {
  if (isStatic(executable)) {
    return executable.command
  }
  return getDynamicExecutable({
    directory: executable.directory,
    regex: executable.regex,
  })
}

export async function getFromExecutable({
  directory,
  command,
  args,
  shellOverride,
}: {
  directory: string
  command: string
  args?: string
  shellOverride?: string
}): Promise<string> {
  const options: ExecOptions = {
    cwd: directory,
  }
  if (shellOverride) {
    options.shell = shellOverride
  }
  const { stdout, stderr } = await execute(`${command} ${args}`, options)
  return `${stdout.trim()}${stderr.trim()}`
}

export async function getFromUrl(url: string): Promise<string> {
  const response = await fetch(url)
  return response.text()
}

export function getFromRegex(text: string, regex: RegExp): string | null {
  const matches = text.match(regex)
  const matchesLength = matches && matches.length ? matches.length : 0
  if (matchesLength <= 0) {
    throw Error(`Could not find match for regex '${regex}' in text '${text}'`)
  }
  return matches && matches[1]
}
