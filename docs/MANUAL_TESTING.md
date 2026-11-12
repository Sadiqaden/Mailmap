# Manual testing with real accounts

The automated tests never touch real mailboxes. These checks verify the live Gmail and Outlook integrations. Record the date, browser and result of each run; until they pass, the integrations are "implemented but unverified".

Use a **test account** with some newsletters in it, not your main mailbox.

## Setup

1. Configure the provider(s) as in [PROVIDER_SETUP.md](PROVIDER_SETUP.md).
2. `npm run dev` and open DevTools (Console + Network).

## Gmail

| #   | Step                                                              | Expected                                                                                                               |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| G1  | Open `/connect/gmail`                                             | Permission explanation; button becomes enabled after "Preparing…"                                                      |
| G2  | Click **Continue to Google**, close the popup                     | "Sign-in was cancelled." No crash                                                                                      |
| G3  | Continue, choose a non-test-user account                          | Google blocks access; Mailmap shows an error                                                                           |
| G4  | Continue with a test user, untick the Gmail checkbox, allow       | "The Gmail permission was not granted"                                                                                 |
| G5  | Continue with a test user and allow                               | Redirect to `/app`; header shows your address                                                                          |
| G6  | Start scan with 250                                               | Progress updates; results appear                                                                                       |
| G7  | In Network, inspect a `messages/<id>` request                     | `format=metadata`, only the six `metadataHeaders`, `fields=id,internalDate,payload/headers`; no `q` parameter anywhere |
| G8  | Check that no request goes to a newsletter domain during the scan | Only `gmail.googleapis.com`                                                                                            |
| G9  | Click **Stop scan** during a 2000 scan                            | Partial-results notice                                                                                                 |
| G10 | Refresh the page                                                  | "No mailbox connected"                                                                                                 |
| G11 | Reconnect, then **Disconnect**                                    | Back on landing; <https://myaccount.google.com/connections> no longer lists Mailmap (may take a minute)                |
| G12 | Wait > 1 hour, then rescan                                        | "Your session has expired" + Reconnect                                                                                 |

## Outlook

| #   | Step                                                  | Expected                                                                 |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| O1  | Open `/connect/outlook`                               | Permission explanation for Mail.Read                                     |
| O2  | Block pop-ups and click Continue                      | "The sign-in window was blocked…"                                        |
| O3  | Allow pop-ups; sign in; cancel at consent             | Cancelled / consent-denied message                                       |
| O4  | Sign in with a personal account and accept            | `/app` with your account name                                            |
| O5  | Scan 250                                              | Results appear; Junk/Deleted Items senders not included                  |
| O6  | Inspect a `/me/messages` request                      | `$select=id,from,receivedDateTime,parentFolderId,internetMessageHeaders` |
| O7  | Refresh                                               | Disconnected                                                             |
| O8  | (Optional) `VITE_MICROSOFT_MAIL_SCOPE=Mail.ReadBasic` | Either works (please report!) or shows "headers-unavailable"             |

## Unsubscribe (real senders)

Use newsletters you actually want to leave.

| #   | Step                                                          | Expected                                                                                  |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| U1  | One-click sender → Unsubscribe → read dialog → Send           | "Request sent". Network shows one POST to the sender, no Authorization header, no cookies |
| U2  | Web-page sender → Open                                        | New tab opens at the sender's page; card shows "Page opened, finish there"                |
| U3  | Mailto sender → Compose                                       | Mail app opens with prefilled recipient/subject; card shows "Manual action required"      |
| U4  | Bulk: select one of each type → confirm                       | One-click items sent; others listed with buttons; per-item results                        |
| U5  | Over the next days, check whether emails from U1 senders stop | Note results — this is the only real confirmation                                         |

## Accessibility spot-check

- Complete the demo flow with keyboard only.
- Run VoiceOver (macOS: Cmd+F5) on the dashboard and an unsubscribe dialog.
- Zoom the browser to 200% and check nothing overlaps.
