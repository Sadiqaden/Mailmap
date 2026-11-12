/**
 * Synthetic demo mailbox.
 *
 * Every name and address here is invented. All domains use the reserved `.example`
 * top-level domain (RFC 2606), so none of them can resolve to a real server.
 *
 * The demo produces raw *message metadata*, not finished newsletter cards. It is fed
 * through exactly the same detection code as Gmail and Outlook data, so the demo
 * exercises the real pipeline — including messages that should NOT be detected.
 */

import type { MessageMetadata } from '../types/mail';

type DemoUnsubscribe =
  | 'one-click'
  | 'one-click-no-dkim' // advertises one-click but has no DKIM pass → treated as a web page
  | 'web'
  | 'web-http'
  | 'mailto'
  | 'web-and-mailto'
  | 'unsafe' // javascript: URI → rejected
  | 'private-ip' // one-click to a private IP → rejected
  | 'none';

interface DemoSender {
  name: string;
  email: string;
  listId?: string;
  precedence?: 'bulk' | 'list';
  unsubscribe: DemoUnsubscribe;
  count: number;
  intervalDays: number;
  /** Days between the newest message and "now". */
  lastDaysAgo: number;
}

export const DEMO_SENDERS: readonly DemoSender[] = [
  {
    name: 'The Morning Byte',
    email: 'hello@morningbyte.example',
    listId: 'daily.morningbyte.example',
    unsubscribe: 'one-click',
    count: 42,
    intervalDays: 1,
    lastDaysAgo: 0,
  },
  {
    name: 'Nordlys Weekly',
    email: 'weekly@nordlys.example',
    listId: 'weekly.nordlys.example',
    unsubscribe: 'one-click',
    count: 12,
    intervalDays: 7,
    lastDaysAgo: 2,
  },
  {
    name: 'Fjordline Travel Deals',
    email: 'offers@fjordline-travel.example',
    unsubscribe: 'one-click',
    count: 18,
    intervalDays: 4,
    lastDaysAgo: 1,
  },
  {
    name: 'Pixel & Pine Design Digest',
    email: 'digest@pixelpine.example',
    listId: 'digest.pixelpine.example',
    unsubscribe: 'web',
    count: 9,
    intervalDays: 7,
    lastDaysAgo: 5,
  },
  {
    name: 'Kaffeklubben',
    email: 'nyhetsbrev@kaffeklubben.example',
    unsubscribe: 'mailto',
    count: 6,
    intervalDays: 30,
    lastDaysAgo: 12,
  },
  {
    name: 'Open Source Roundup',
    email: 'roundup@lists.osroundup.example',
    listId: 'roundup.lists.osroundup.example',
    precedence: 'list',
    unsubscribe: 'web-and-mailto',
    count: 14,
    intervalDays: 7,
    lastDaysAgo: 3,
  },
  {
    name: 'Startup Signals',
    email: 'news@startupsignals.example',
    unsubscribe: 'one-click',
    count: 22,
    intervalDays: 3,
    lastDaysAgo: 0,
  },
  {
    name: 'Bokhylla Book Club',
    email: 'club@bokhylla.example',
    unsubscribe: 'web',
    count: 4,
    intervalDays: 30,
    lastDaysAgo: 40,
  },
  {
    name: 'Green Grocer Offers',
    email: 'deals@greengrocer.example',
    unsubscribe: 'one-click-no-dkim',
    count: 25,
    intervalDays: 2,
    lastDaysAgo: 1,
  },
  {
    name: 'Data Dispatch',
    email: 'dispatch@datadispatch.example',
    listId: 'dispatch.datadispatch.example',
    unsubscribe: 'one-click',
    count: 8,
    intervalDays: 14,
    lastDaysAgo: 9,
  },
  {
    name: 'Trail & Summit',
    email: 'trails@trailsummit.example',
    unsubscribe: 'web-http',
    count: 5,
    intervalDays: 21,
    lastDaysAgo: 25,
  },
  {
    name: 'Frontend Friday',
    email: 'friday@frontendfriday.example',
    listId: 'friday.frontendfriday.example',
    unsubscribe: 'one-click',
    count: 10,
    intervalDays: 7,
    lastDaysAgo: 6,
  },
  {
    name: 'Studentliv Oppdateringer',
    email: 'updates@studentliv.example',
    precedence: 'bulk',
    unsubscribe: 'none',
    count: 7,
    intervalDays: 10,
    lastDaysAgo: 15,
  },
  {
    name: 'Sunday Recipes',
    email: 'recipes@sundayrecipes.example',
    unsubscribe: 'mailto',
    count: 11,
    intervalDays: 7,
    lastDaysAgo: 4,
  },
  {
    name: 'Cloud Costs Weekly',
    email: 'weekly@cloudcosts.example',
    listId: 'weekly.cloudcosts.example',
    unsubscribe: 'one-click',
    count: 3,
    intervalDays: 7,
    lastDaysAgo: 70,
  },
  {
    name: 'Retro Gaming Gazette',
    email: 'gazette@retrogazette.example',
    unsubscribe: 'unsafe',
    count: 6,
    intervalDays: 14,
    lastDaysAgo: 20,
  },
  {
    name: 'Indie Music Notes',
    email: 'notes@indiemusicnotes.example',
    unsubscribe: 'web',
    count: 2,
    intervalDays: 30,
    lastDaysAgo: 100,
  },
  {
    name: 'Language Lab',
    email: 'news@languagelab.example',
    unsubscribe: 'private-ip',
    count: 5,
    intervalDays: 7,
    lastDaysAgo: 8,
  },
  {
    name: 'Webinar Alerts',
    email: 'alerts@webinarhub.example',
    unsubscribe: 'one-click',
    count: 15,
    intervalDays: 5,
    lastDaysAgo: 2,
  },
  {
    name: 'Plant Parent Tips',
    email: 'newsletter@plantparent.example',
    unsubscribe: 'none',
    count: 4,
    intervalDays: 14,
    lastDaysAgo: 18,
  },
  {
    name: 'Quantum Quarterly',
    email: 'editors@quantumquarterly.example',
    listId: 'quarterly.quantumquarterly.example',
    unsubscribe: 'web',
    count: 3,
    intervalDays: 90,
    lastDaysAgo: 30,
  },
  {
    name: 'Budget Banter',
    email: 'banter@budgetbanter.example',
    unsubscribe: 'one-click',
    count: 9,
    intervalDays: 7,
    lastDaysAgo: 3,
  },
];

/** Ordinary mail that must NOT be detected as newsletters. */
const PERSONAL_SENDERS = [
  { name: 'Kari Nordmann', email: 'kari.nordmann@mail.example', count: 8 },
  { name: 'Study Group', email: 'studygroup@uni.example', count: 5 },
  { name: 'Bank Notifications', email: 'noreply@bank.example', count: 6 },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function unsubscribeHeaders(sender: DemoSender): Partial<MessageMetadata> {
  const domain = sender.email.split('@')[1] ?? 'example';
  const dkim = `mx.example; dkim=pass header.d=${domain}; spf=pass`;
  const https = `https://${domain}/unsubscribe?u=demo`;
  switch (sender.unsubscribe) {
    case 'one-click':
      return {
        listUnsubscribe: `<${https}>, <mailto:unsubscribe@${domain}?subject=unsubscribe>`,
        listUnsubscribePost: 'List-Unsubscribe=One-Click',
        authenticationResults: dkim,
      };
    case 'one-click-no-dkim':
      return {
        listUnsubscribe: `<${https}>`,
        listUnsubscribePost: 'List-Unsubscribe=One-Click',
        authenticationResults: 'mx.example; dkim=none; spf=pass',
      };
    case 'web':
      return { listUnsubscribe: `<${https}>`, authenticationResults: dkim };
    case 'web-http':
      return { listUnsubscribe: `<http://${domain}/unsubscribe>`, authenticationResults: dkim };
    case 'mailto':
      return {
        listUnsubscribe: `<mailto:leave@${domain}?subject=Unsubscribe>`,
        authenticationResults: dkim,
      };
    case 'web-and-mailto':
      return {
        listUnsubscribe: `<mailto:leave@${domain}>, <${https}>`,
        authenticationResults: dkim,
      };
    case 'unsafe':
      return {
        listUnsubscribe: '<javascript:alert(document.domain)>',
        authenticationResults: dkim,
      };
    case 'private-ip':
      return {
        listUnsubscribe: '<https://192.168.1.1/unsubscribe>',
        listUnsubscribePost: 'List-Unsubscribe=One-Click',
        authenticationResults: dkim,
      };
    case 'none':
      return {};
  }
}

/**
 * Generate the synthetic mailbox, newest messages first.
 * Deterministic for a given `now`, which makes tests predictable.
 */
export function generateDemoMessages(now: number): MessageMetadata[] {
  const messages: MessageMetadata[] = [];

  for (const sender of DEMO_SENDERS) {
    const headers = unsubscribeHeaders(sender);
    for (let i = 0; i < sender.count; i++) {
      messages.push({
        id: `demo-${sender.email}-${i}`,
        receivedAt:
          now - (sender.lastDaysAgo + i * sender.intervalDays) * DAY_MS - i * 37 * 60 * 1000,
        from: { name: sender.name, email: sender.email },
        listUnsubscribe: headers.listUnsubscribe ?? null,
        listUnsubscribePost: headers.listUnsubscribePost ?? null,
        listId: sender.listId ? `${sender.name} <${sender.listId}>` : null,
        precedence: sender.precedence ?? null,
        authenticationResults: headers.authenticationResults ?? null,
      });
    }
  }

  for (const person of PERSONAL_SENDERS) {
    for (let i = 0; i < person.count; i++) {
      messages.push({
        id: `demo-${person.email}-${i}`,
        receivedAt: now - (i * 3 + 1) * DAY_MS,
        from: { name: person.name, email: person.email },
        listUnsubscribe: null,
        listUnsubscribePost: null,
        listId: null,
        precedence: null,
        authenticationResults: 'mx.example; dkim=pass',
      });
    }
  }

  return messages.sort((a, b) => b.receivedAt - a.receivedAt);
}

/** Number of newsletter senders the detector is expected to find in the demo mailbox. */
export const EXPECTED_DEMO_NEWSLETTERS = DEMO_SENDERS.length;
