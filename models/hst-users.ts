export type HST_Apps = 'voicebridge' | 'tokei' | 'sky-survey'

export type MarketingSource =
  | 'content'
  | 'direct'
  | 'email_campaign'
  | 'organic_search'
  | 'paid_ad'
  | 'referral'
  | 'social_media'
  | 'other'

export type HST_APP_User = {
  _id: string
  email: string
  joined: Date | string
  status: 'emailOnly' | 'activeCustomer' | 'formerCustomer' | 'doNotContact'
  usesApps?: HST_Apps[]
  // Personal info for personalization
  firstName?: string
  lastName?: string
  source?: MarketingSource
  // Notes for manual entries by marketing team
  marketingNotes?: string
  allowsMarketingEmails?: boolean
}
