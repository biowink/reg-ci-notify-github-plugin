import { NotifierPluginFactory } from 'reg-suit-interface'
import { CINotifyGitHubPlugin } from './plugin'

const factory: NotifierPluginFactory = () => ({
  notifier: new CINotifyGitHubPlugin(),
})

export = factory
