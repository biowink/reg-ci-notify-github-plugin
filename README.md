# reg-ci-notify-github-plugin
A reg-suit plugin that comments on your PR with the results of your regression test, and a link to the report if available.

## Installation

```sh
npm install --save-dev reg-ci-notify-github-plugin
```

or

```sh
yarn add --dev reg-ci-notify-github-plugin
```

## Usage

Add the plugin to your `regconfig.json`:

```JSON
{
  "plugins": {
    "@clue/reg-ci-notify-github-plugin": true
  }
}
```

In your CI configuration, set the following two environment variables:
- `CI_PULL_REQUEST`: The full URL to the pull request that the build was triggered by. (This is set automatically by CirleCI per their [docs](https://circleci.com/docs/1.0/environment-variables/#build-details).)
- `GITHUB_TOKEN`: A token for a GitHub account that has permission to read the repo and comment on PRs.
