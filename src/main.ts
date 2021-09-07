import * as core from '@actions/core'
import {getOctokit, context} from '@actions/github'

async function run(): Promise<void> {
  const source = core.getInput('source-branch', {required: true})
  const target = core.getInput('target-branch', {required: true})
  const token = core.getInput('token', {required: true})
  const title = core.getInput('title') ?? `sync: merge ${target} into ${source}`

  const {owner, repo} = context.repo
  const github = getOctokit(token).rest

  // Look for any open PR matching the pair
  const existing = await github.pulls.list({
    owner,
    repo,
    head: `${owner}:${source}`,
    target,
    state: 'open'
  })
  if (existing.data.length !== 0) {
    core.info(`PR already exists for this source/target pair`)
    core.info(`PR details: ${existing.data[0].url}`)

    return
  }

  // Do perform creation
  await github.pulls.create({
    owner,
    repo,
    head: source,
    base: target,
    title
  })
}

run()
