import { NotifierPlugin, NotifyParams, PluginCreateOptions, PluginLogger } from 'reg-suit-interface'
import * as Octokit from '@octokit/rest'

// This string identifies a comment as a visual regression report. We can check
// whether this string appears in a comment to determine whether to update an
// existing comment or create a new one.
const COMMENT_IDENTIFIER = '<!-- reg-ci-notify-github-plugin -->'

const extractPRParams = (url: string): Octokit.IssuesGetParams => {
  const path = url.replace('https://github.com/', '')

  const [owner, repo, _, number] = path.split('/')

  return {
    owner,
    repo,
    number: parseInt(number, 10),
  }
}

const generateBodyFromNotifyParams = (params: NotifyParams): string => {
  const { comparisonResult } = params

  let body: string = `
${COMMENT_IDENTIFIER}
## Visual regression report
- ${comparisonResult.newItems.length} new items
- ${comparisonResult.deletedItems.length} deleted items
- ${comparisonResult.passedItems.length} comparisons passed
- ${comparisonResult.failedItems.length} comparisons failed
  `

  if (params.reportUrl) {
    body += `
View the full report [here](${params.reportUrl}).
`
  }

  return body
}

export interface Options {}

export class CINotifyGitHubPlugin implements NotifierPlugin<Options> {
  init(config: PluginCreateOptions<Options>): void {
    // noop
  }

  async notify(params: NotifyParams): Promise<any> {
    const prURL = process.env.CI_PULL_REQUEST
    const githubToken = process.env.GITHUB_TOKEN
    if (!prURL || !githubToken) {
      return Promise.resolve()
    }

    const octokit = new Octokit({
      headers: {
        Authorization: `token ${githubToken}`,
      },
    })

    const prParams = extractPRParams(prURL)
    const body = generateBodyFromNotifyParams(params)

    let existingComments
    let me
    try {
      me = await octokit.users.get({})
      existingComments = await octokit.issues.getComments({ ...prParams })
    } catch (e) {
      console.error(e)
      return Promise.resolve()
    }

    const existingComment = existingComments.data.find(comment => comment.user.id === me.data.id && comment.body.includes(COMMENT_IDENTIFIER))

    if (existingComment) {
      await octokit.issues.editComment({
        owner: prParams.owner,
        repo: prParams.repo,
        id: existingComment.id,
        body,
      }).catch(console.error)
      return Promise.resolve()
    }

    await octokit.issues.createComment({ ...prParams, body }).catch(console.error)
    return Promise.resolve()
  }
}
