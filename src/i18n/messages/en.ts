/**
 * English UI text. This file defines the *shape* of all translations:
 * `nb.ts` must provide exactly the same keys (TypeScript enforces it).
 */
const en = {
  common: {
    appName: 'Mailmap',
    demoBadge: 'Demo',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    retry: 'Try again',
    loading: 'Loading…',
    skipToContent: 'Skip to main content',
    languageLabel: 'Language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    newTab: '(opens in a new tab)',
    languages: { nb: 'Norsk', en: 'English' },
  },
  nav: {
    features: 'Features',
    privacy: 'Privacy',
    faq: 'FAQ',
    demo: 'Try the demo',
    home: 'Home',
    dashboard: 'Dashboard',
  },
  landing: {
    eyebrow: 'Newsletter manager for Gmail and Outlook',
    title: 'Take control of your newsletters.',
    subtitle:
      "Discover what's filling your inbox, all in one place. Mailmap finds newsletter senders from email headers and helps you unsubscribe safely.",
    ctaGmail: 'Connect Gmail',
    ctaOutlook: 'Connect Outlook',
    ctaDemo: 'Explore the demo',
    ctaNote: 'The demo uses invented data and needs no account.',
    previewLabel: 'Illustration of the Mailmap dashboard with invented example data',
    previewCaption: 'Illustration with invented data',
    problemTitle: 'Newsletters pile up quietly',
    problemBody:
      'A sign-up here, a receipt there, and suddenly dozens of senders compete for your attention. Most email apps show messages one by one, not who keeps sending them.',
    benefitsTitle: 'What Mailmap does',
    benefits: {
      discoverTitle: 'Find newsletter senders',
      discoverBody:
        'Mailmap reads mailing-list headers such as List-Unsubscribe and List-Id from your most recent messages and groups them by sender.',
      organizeTitle: 'See everything at a glance',
      organizeBody:
        'Search, filter and sort senders by volume or recent activity, with an estimated sending frequency.',
      unsubscribeTitle: 'Unsubscribe with care',
      unsubscribeBody:
        'Use standard unsubscribe methods after you confirm. Mailmap tells you honestly when it cannot do it for you.',
      privacyTitle: 'Runs in your browser',
      privacyBody:
        'No Mailmap server, no database, no analytics. Results live in this browser tab and disappear when you close it.',
    },
    privacyTitle: 'Privacy by design, explained plainly',
    privacyBody:
      'Mailmap asks for read-only access and only requests message headers. Here is what that means in practice:',
    privacyPoints: {
      p1: 'Gmail: the metadata permission, which cannot read message bodies or attachments.',
      p2: 'Outlook: Microsoft has no headers-only permission that we have verified, so Mailmap requests read access but only asks Microsoft Graph for sender, date and headers.',
      p3: 'Nothing is sent to a Mailmap server, because there is none.',
      p4: 'Unsubscribe requests go from your browser directly to the sender, and only after you confirm.',
    },
    privacyLink: 'Read the full privacy explanation',
    faqTitle: 'Frequently asked questions',
    faq: {
      q1: 'Will Mailmap find every newsletter?',
      a1: 'No. It scans a limited number of your most recent messages and recognizes senders that use mailing-list headers or look like newsletters. Some will be missed, and a detected sender does not prove you are still subscribed.',
      q2: 'Can Mailmap unsubscribe automatically?',
      a2: 'Only when the sender supports one-click unsubscribe (RFC 8058), and only after you confirm. Even then Mailmap cannot see the reply, so it reports "request sent", not "unsubscribed". Other senders require you to finish on their web page or send an email.',
      q3: 'Does Mailmap read my emails?',
      a3: 'It requests headers only (sender, date and mailing-list headers). It never requests subjects, bodies or attachments. For Outlook the granted permission would technically allow reading bodies, but Mailmap never asks for them.',
      q4: 'Where is my data stored?',
      a4: 'Only in the memory of your browser tab. Refreshing or closing the tab removes it. Your language choice is the only thing saved in the browser.',
      q5: 'Why does Google show a warning when I connect?',
      a5: 'Gmail metadata access is a "restricted" scope. Until an app passes Google\'s verification, Google shows a warning and limits it to approved test users.',
    },
    footerBuiltBy: 'Built by Sadiq Aden, with AI assistance.',
    footerLicense: 'Open source under the MIT License.',
    footerNoTracking: 'No cookies, analytics or trackers.',
  },
  connect: {
    titleGmail: 'Connect Gmail',
    titleOutlook: 'Connect Outlook',
    intro: 'Before you continue, here is exactly what Mailmap will ask for and what it will do.',
    permissionTitle: 'Permission requested',
    gmailScopeName: 'View your email message metadata (gmail.metadata)',
    gmailScopeBody:
      'Lets Mailmap read labels and message headers. It does not allow reading message bodies or attachments, sending, deleting or changing anything.',
    outlookScopeNameRead: 'Read your mail (Mail.Read)',
    outlookScopeBodyRead:
      'Microsoft only offers read permissions for the whole message. Mailmap uses it to request sender, date and internet headers, and never requests subjects, bodies or attachments. It cannot send, delete or change mail.',
    outlookScopeNameBasic: 'Read basic mail (Mail.ReadBasic)',
    outlookScopeBodyBasic:
      'Excludes message bodies, previews and attachments. Mailmap uses it to request sender, date and internet headers. It cannot send, delete or change mail.',
    outlookSignInNote:
      'Microsoft also asks to sign you in and read your basic profile (your email address).',
    whatHappensTitle: 'What happens next',
    steps: {
      s1: 'A {provider} window opens where you choose an account and approve access.',
      s2: 'You choose how many recent messages to scan. Mailmap fetches their headers directly from {provider} to this browser tab.',
      s3: 'Results stay in this tab only. Refreshing or closing it removes them.',
    },
    gmailVerificationNote:
      'This deployment may not be verified by Google yet. If so, Google shows a warning, and only test users added by the developer can connect.',
    continueGmail: 'Continue to Google',
    continueOutlook: 'Continue to Microsoft',
    preparing: 'Preparing secure sign-in…',
    waiting: 'Waiting for you to finish in the sign-in window…',
    notConfiguredTitle: '{provider} is not configured for this deployment',
    notConfiguredBody:
      'The developer has not added an OAuth client ID for {provider}. You can still explore Mailmap in demo mode. Setup steps are in docs/PROVIDER_SETUP.md.',
    tryDemoInstead: 'Explore the demo instead',
  },
  dashboard: {
    title: 'Your newsletters',
    titleDemo: 'Demo dashboard',
    demoBannerTitle: 'Demo mode, with invented data',
    demoBannerBody:
      'Every sender here is fictional. Unsubscribe actions are simulated and nothing is sent anywhere. The demo does not prove that the Gmail or Outlook connections work.',
    connectedAs: 'Connected as {account}',
    connectionDemo: 'Demo, with no account connected',
    notConnectedTitle: 'No mailbox connected',
    notConnectedBody:
      'Sessions are kept in memory only, so refreshing the page disconnects you. Connect again, or explore the demo.',
    readyTitle: 'Ready to scan',
    readyBody:
      'Mailmap will read the headers of your most recent messages, excluding spam and trash, and look for newsletter senders. Nothing is changed in your mailbox.',
    limitLabel: 'Messages to scan',
    limitOption: '{count} most recent',
    startScan: 'Start scan',
    rescan: 'Scan again',
    scanningTitle: 'Scanning your mailbox',
    scanningProgress: 'Read {processed} of up to {target} messages',
    cancelScan: 'Stop scan',
    partialNotice: 'Scan stopped early. Results cover only the {count} messages read so far.',
    scanSummary: {
      one: 'Based on {count} scanned message',
      other: 'Based on {count} scanned messages',
    },
    privacyPanelTitle: 'What Mailmap can see',
    privacyPanelBody:
      "Only the sender, date and mailing-list headers of scanned messages, kept in this tab's memory. No subjects, bodies or attachments are requested.",
    privacyPanelLink: 'Full privacy details',
  },
  stats: {
    label: 'Scan statistics',
    senders: 'Newsletter senders',
    emails: 'Newsletter emails',
    withUnsubscribe: 'With unsubscribe option',
    recent: 'Active in the last 30 days',
    disclaimer:
      'Numbers cover only the scanned messages and may not include every subscription in your account.',
  },
  toolbar: {
    searchLabel: 'Search newsletters',
    searchPlaceholder: 'Search by name, address or domain',
    filterLabel: 'Filter',
    sortLabel: 'Sort by',
    filters: {
      all: 'All newsletters',
      recent: 'Recently active',
      'unsubscribe-available': 'Unsubscribe available',
      manual: 'Manual action required',
      selected: 'Selected',
    },
    sorts: {
      recent: 'Most recently received',
      count: 'Most emails',
      name: 'Name (A–Z)',
    },
    resultCount: {
      one: 'Showing {count} of {total} newsletters',
      other: 'Showing {count} of {total} newsletters',
    },
  },
  selection: {
    selectVisible: 'Select all shown',
    clear: 'Clear selection',
    count: {
      one: '{count} selected',
      other: '{count} selected',
    },
    bulkUnsubscribe: 'Unsubscribe from selected',
    toolbarLabel: 'Bulk actions',
  },
  empty: {
    noMatchesTitle: 'No newsletters match',
    noMatchesBody: 'Try a different search or filter.',
    clearFilters: 'Clear search and filters',
    noneFoundTitle: 'No newsletters found',
    noneFoundBody:
      'No newsletter-like senders were found in the scanned messages. Try scanning more messages. Some newsletters do not use standard headers and cannot be detected.',
  },
  card: {
    select: 'Select {name}',
    emails: {
      one: '{count} email',
      other: '{count} emails',
    },
    lastReceived: 'Last received',
    frequencyLabel: 'Estimated frequency',
    frequency: {
      daily: 'About daily',
      weekly: 'About weekly',
      monthly: 'About monthly',
      occasional: 'Occasionally',
      unknown: 'Not enough data',
    },
    estimate: 'estimate',
    activity: {
      recent: 'Recently active',
      inactive: 'No email in 30 days',
    },
    confidence: {
      high: 'Mailing-list headers found',
      medium: 'Marked as bulk mail',
      low: 'Possible newsletter (address pattern)',
    },
    method: {
      'one-click': 'One-click unsubscribe',
      web: 'Unsubscribe page',
      mailto: 'Unsubscribe by email',
      none: 'No unsubscribe option found',
    },
    action: {
      'one-click': 'Unsubscribe',
      web: 'Open unsubscribe page',
      mailto: 'Unsubscribe by email',
      none: 'How to unsubscribe',
      details: 'View details',
    },
  },
  outcome: {
    sending: 'Sending request…',
    requestSent: 'Request sent',
    requestSentHint: "Not confirmed. If emails keep arriving, unsubscribe on the sender's page.",
    pageOpened: 'Page opened, finish there',
    manualRequired: 'Manual action required: send the email',
    failed: {
      network: 'Could not send the request',
      timeout: 'Request timed out',
      'invalid-url': 'Unsafe link, request not sent',
    },
    simulated: 'Simulated (demo)',
  },
  unsubscribe: {
    title: 'Unsubscribe from {name}',
    senderLine: 'Sender: {email}',
    oneClick: {
      heading: 'One-click unsubscribe (RFC 8058)',
      p1: 'Your browser sends a single unsubscribe request directly to {host}.',
      p2: 'No Google or Microsoft login tokens and no cookies are included. The sender will see your IP address, as with any website visit.',
      p3: 'Browsers do not let Mailmap read the sender\'s reply, so the result cannot be confirmed. It is shown as "Request sent".',
      confirm: 'Send unsubscribe request',
    },
    web: {
      heading: 'Unsubscribe page',
      p1: 'This sender only offers an unsubscribe web page at {host}. It opens in a new tab, where you finish the process.',
      p2: 'Mailmap cannot check this website. Do not enter passwords or payment details there.',
      insecure:
        'This link uses unencrypted HTTP. Others on your network could see or change the page.',
      open: 'Open {host}',
    },
    mailto: {
      heading: 'Unsubscribe by email',
      p1: 'This sender asks you to email {address}.',
      p2: 'Mailmap does not have permission to send email. Your email app opens with a prefilled message, and you need to send it yourself.',
      compose: 'Compose email',
    },
    none: {
      heading: 'No unsubscribe option found',
      p1: 'The scanned messages from this sender contain no usable unsubscribe header.',
      tip1: 'Open a recent email from the sender and look for an unsubscribe link near the bottom.',
      tip2: 'Gmail and Outlook can also block a sender or filter their mail.',
      tip3: 'If you never signed up, mark the email as spam in your email app.',
    },
    rejected: {
      one: '{count} link from this sender was ignored because it looked unsafe.',
      other: '{count} links from this sender were ignored because they looked unsafe.',
    },
    alternativesTitle: 'Other options from this sender',
    demoNote: 'Demo mode: nothing will be sent or opened. The action is only simulated.',
    simulate: 'Simulate',
  },
  bulk: {
    title: 'Unsubscribe from {count} newsletters',
    intro: 'Review what will happen for each selected newsletter before you confirm.',
    oneClickTitle: 'Sent automatically after you confirm',
    oneClickNote:
      'One request per sender goes directly from your browser to that sender. Results cannot be confirmed.',
    manualTitle: 'Needs your action',
    manualNote: 'These senders need you to open a page or send an email. Use the buttons below.',
    unavailableTitle: 'No unsubscribe option found',
    confirm: {
      one: 'Send {count} request',
      other: 'Send {count} requests',
    },
    confirmDemo: {
      one: 'Simulate {count} request',
      other: 'Simulate {count} requests',
    },
    nothingAutomatic: 'None of the selected newsletters support one-click unsubscribe.',
    resultsTitle: 'Results',
    done: 'Done',
  },
  account: {
    menuLabel: 'Account menu',
    privacy: 'Privacy',
    disconnect: 'Disconnect',
    exitDemo: 'Exit demo',
    revokeGmail: "Disconnecting revokes Mailmap's Google access token.",
    revokeOutlook:
      'Disconnecting clears tokens from this tab. To remove consent, visit your Microsoft account settings.',
  },
  errors: {
    title: 'Something went wrong',
    'not-configured': 'This provider is not configured for this deployment.',
    'script-load-failed':
      'The sign-in library could not be loaded. Check your connection or content blockers.',
    'popup-blocked': 'The sign-in window was blocked. Allow pop-ups for this site and try again.',
    cancelled: 'Sign-in was cancelled.',
    'consent-denied': 'Access was not granted. Mailmap cannot scan without read access.',
    'scope-missing':
      "The Gmail permission was not granted. Tick the permission checkbox in Google's window to continue.",
    unauthorized: 'Your session has expired. Connect again to continue.',
    forbidden: 'The provider refused the request. The account may not allow this app.',
    'rate-limited': 'The provider is limiting requests right now. Wait a minute and try again.',
    network: 'Network error. Check your connection and try again.',
    server: 'The provider returned an error. Try again later.',
    'headers-unavailable':
      'Microsoft returned messages without headers, so newsletters cannot be detected. The Mail.ReadBasic permission may not include headers. Use Mail.Read (see the setup guide).',
    unknown: 'An unexpected error occurred.',
    reconnect: 'Reconnect',
  },
  privacy: {
    title: 'Privacy',
    intro:
      'This page describes what the Mailmap code in this repository actually does. If you use a copy hosted by someone else, they could have changed it.',
    permissionsTitle: 'Permissions Mailmap requests',
    permissionsGmail:
      'Gmail: https://www.googleapis.com/auth/gmail.metadata, which covers labels, history and message headers but not bodies or attachments. Google classifies it as a restricted scope.',
    permissionsOutlook:
      'Outlook: Mail.Read by default, plus the standard sign-in permissions (openid, profile, offline_access). Mail.Read would allow reading message bodies. Mailmap does not request them, but the permission itself does not prevent it. Deployments can switch to Mail.ReadBasic; see the documentation.',
    retrievedTitle: 'What is retrieved',
    retrievedBody:
      'For each scanned message: an internal message ID, the received date, the sender name and address, and these headers if present: List-Unsubscribe, List-Unsubscribe-Post, List-Id, Precedence and Authentication-Results. Outlook also returns the folder ID so spam and deleted items can be skipped. Your Gmail address, or your Microsoft account name, is shown in the header.',
    bodiesTitle: 'Are message bodies accessed?',
    bodiesBody:
      "No. Mailmap never requests subjects, bodies, previews or attachments. For Gmail, the permission does not allow them. For Outlook, Mailmap's requests explicitly select only the fields listed above.",
    processingTitle: 'Where data is processed',
    processingBody:
      'Entirely in your browser. Mailmap has no backend server and no database. Your browser talks directly to Google (gmail.googleapis.com, accounts.google.com) or Microsoft (graph.microsoft.com, login.microsoftonline.com).',
    storageTitle: 'What is stored, and for how long',
    storageBody:
      "Scan results and access tokens are kept in memory for this tab only. Microsoft's sign-in library briefly stores sign-in state in session storage while the sign-in window is open. Your language preference is saved in local storage. Nothing else is saved.",
    refreshTitle: 'When you refresh or close the tab',
    refreshBody:
      'Everything in memory is gone: scan results, selections, unsubscribe statuses and tokens. You need to connect again.',
    thirdPartiesTitle: 'Who else receives data',
    thirdPartiesBody:
      'Google or Microsoft, which you connect to and which already hold your mail. Newsletter senders, only when you confirm an unsubscribe: they receive a request from your IP address, or you open their page, or you email them. Mailmap uses no analytics, ads or tracking scripts, and the font is served from this site.',
    disconnectTitle: 'Disconnecting and revoking access',
    disconnectBody:
      'Use "Disconnect" in the account menu. For Gmail, this also revokes the access token at Google. For Outlook, it clears the tokens in this tab.',
    revokeGoogle: "Remove Mailmap's access in your Google Account",
    revokeMicrosoft: 'Manage app permissions for your personal Microsoft account',
    revokeWork:
      'Work or school accounts: go to My Apps (myapps.microsoft.com) or contact your administrator.',
    limitsTitle: 'Limitations',
    limitsBody:
      'Detection is heuristic and covers only scanned messages. Unsubscribe results cannot be confirmed. Unsubscribe links come from emails that anyone can send, so Mailmap filters out unsafe links but cannot vouch for any website.',
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist.',
    home: 'Go to the front page',
  },
};

export type Messages = typeof en;
export default en;
