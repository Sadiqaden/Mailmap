import type { Messages } from './en';

/**
 * Norsk bokmål. The `Messages` type annotation makes TypeScript report any key that
 * is missing here or that does not exist in English.
 */
const nb: Messages = {
  common: {
    appName: 'Mailmap',
    demoBadge: 'Demo',
    close: 'Lukk',
    cancel: 'Avbryt',
    back: 'Tilbake',
    retry: 'Prøv igjen',
    loading: 'Laster …',
    skipToContent: 'Hopp til hovedinnhold',
    languageLabel: 'Språk',
    openMenu: 'Åpne meny',
    closeMenu: 'Lukk meny',
    newTab: '(åpnes i ny fane)',
    languages: { nb: 'Norsk', en: 'English' },
  },
  nav: {
    features: 'Funksjoner',
    privacy: 'Personvern',
    faq: 'Spørsmål og svar',
    demo: 'Prøv demoen',
    home: 'Forside',
    dashboard: 'Oversikt',
  },
  landing: {
    eyebrow: 'Nyhetsbrevoversikt for Gmail og Outlook',
    title: 'Ta kontroll over nyhetsbrevene dine.',
    subtitle:
      'Se hva som fyller innboksen din, samlet på ett sted. Mailmap finner avsendere av nyhetsbrev ut fra e-posthoder og hjelper deg å melde deg av på en trygg måte.',
    ctaGmail: 'Koble til Gmail',
    ctaOutlook: 'Koble til Outlook',
    ctaDemo: 'Utforsk demoen',
    ctaNote: 'Demoen bruker oppdiktede data og krever ingen konto.',
    previewLabel: 'Illustrasjon av Mailmap-oversikten med oppdiktede eksempeldata',
    previewCaption: 'Illustrasjon med oppdiktede data',
    problemTitle: 'Nyhetsbrev hoper seg opp i det stille',
    problemBody:
      'En påmelding her, en kvittering der, og plutselig konkurrerer dusinvis av avsendere om oppmerksomheten din. De fleste e-postprogrammer viser meldinger én og én, ikke hvem som stadig sender dem.',
    benefitsTitle: 'Dette gjør Mailmap',
    benefits: {
      discoverTitle: 'Finn avsendere av nyhetsbrev',
      discoverBody:
        'Mailmap leser e-postlistehoder som List-Unsubscribe og List-Id fra de nyeste meldingene dine og grupperer dem etter avsender.',
      organizeTitle: 'Se alt på ett sted',
      organizeBody:
        'Søk, filtrer og sorter avsendere etter antall e-poster eller nylig aktivitet, med en anslått sendefrekvens.',
      unsubscribeTitle: 'Meld deg av med omhu',
      unsubscribeBody:
        'Bruk standardiserte avmeldingsmetoder etter at du har bekreftet. Mailmap sier ærlig fra når den ikke kan gjøre det for deg.',
      privacyTitle: 'Kjører i nettleseren din',
      privacyBody:
        'Ingen Mailmap-server, ingen database, ingen analyseverktøy. Resultatene finnes bare i denne nettleserfanen og forsvinner når du lukker den.',
    },
    privacyTitle: 'Personvern som en del av designet, forklart enkelt',
    privacyBody:
      'Mailmap ber om lesetilgang og henter bare e-posthoder. Dette betyr det i praksis:',
    privacyPoints: {
      p1: 'Gmail: tillatelsen for metadata, som ikke gir tilgang til meldingsinnhold eller vedlegg.',
      p2: 'Outlook: Microsoft har ingen tillatelse kun for e-posthoder som vi har bekreftet, så Mailmap ber om lesetilgang, men henter bare avsender, dato og hoder fra Microsoft Graph.',
      p3: 'Ingenting sendes til en Mailmap-server, for det finnes ingen.',
      p4: 'Avmeldingsforespørsler går fra nettleseren din direkte til avsenderen, og bare etter at du har bekreftet.',
    },
    privacyLink: 'Les hele personvernforklaringen',
    faqTitle: 'Ofte stilte spørsmål',
    faq: {
      q1: 'Finner Mailmap alle nyhetsbrev?',
      a1: 'Nei. Mailmap skanner et begrenset antall av de nyeste meldingene dine og gjenkjenner avsendere som bruker e-postlistehoder eller ser ut som nyhetsbrev. Noen vil ikke bli funnet, og en funnet avsender betyr ikke nødvendigvis at du fortsatt abonnerer.',
      q2: 'Kan Mailmap melde meg av automatisk?',
      a2: 'Bare når avsenderen støtter ettklikks avmelding (RFC 8058), og bare etter at du har bekreftet. Selv da kan ikke Mailmap se svaret, så den viser «forespørsel sendt», ikke «avmeldt». Andre avsendere krever at du fullfører på nettsiden deres eller sender en e-post.',
      q3: 'Leser Mailmap e-postene mine?',
      a3: 'Mailmap henter bare e-posthoder (avsender, dato og e-postlistehoder). Den ber aldri om emnefelt, innhold eller vedlegg. For Outlook gir tillatelsen teknisk sett tilgang til innhold, men Mailmap ber aldri om det.',
      q4: 'Hvor lagres dataene mine?',
      a4: 'Bare i minnet til nettleserfanen. Oppdaterer eller lukker du fanen, forsvinner de. Språkvalget ditt er det eneste som lagres i nettleseren.',
      q5: 'Hvorfor viser Google en advarsel når jeg kobler til?',
      a5: 'Tilgang til Gmail-metadata er et «begrenset» omfang. Inntil en app er godkjent av Google, viser Google en advarsel og begrenser tilgangen til godkjente testbrukere.',
    },
    footerBuiltBy: 'Laget av Sadiq Aden, med hjelp fra KI.',
    footerLicense: 'Åpen kildekode under MIT-lisensen.',
    footerNoTracking: 'Ingen informasjonskapsler, analyse eller sporing.',
  },
  connect: {
    titleGmail: 'Koble til Gmail',
    titleOutlook: 'Koble til Outlook',
    intro: 'Før du fortsetter: her er nøyaktig hva Mailmap ber om, og hva den vil gjøre.',
    permissionTitle: 'Tillatelse som blir forespurt',
    gmailScopeName: 'Se metadata for e-postmeldingene dine (gmail.metadata)',
    gmailScopeBody:
      'Lar Mailmap lese etiketter og e-posthoder. Gir ikke tilgang til meldingsinnhold eller vedlegg, og kan ikke sende, slette eller endre noe.',
    outlookScopeNameRead: 'Lese e-posten din (Mail.Read)',
    outlookScopeBodyRead:
      'Microsoft tilbyr bare lesetillatelser for hele meldingen. Mailmap bruker den til å hente avsender, dato og e-posthoder, og ber aldri om emnefelt, innhold eller vedlegg. Den kan ikke sende, slette eller endre e-post.',
    outlookScopeNameBasic: 'Lese grunnleggende e-post (Mail.ReadBasic)',
    outlookScopeBodyBasic:
      'Gir ikke tilgang til meldingsinnhold, forhåndsvisning eller vedlegg. Mailmap bruker den til å hente avsender, dato og e-posthoder. Den kan ikke sende, slette eller endre e-post.',
    outlookSignInNote:
      'Microsoft ber også om å logge deg inn og lese den grunnleggende profilen din (e-postadressen din).',
    whatHappensTitle: 'Dette skjer videre',
    steps: {
      s1: 'Et vindu fra {provider} åpnes, der du velger konto og godkjenner tilgang.',
      s2: 'Du velger hvor mange nyere meldinger som skal skannes. Mailmap henter e-posthodene direkte fra {provider} til denne nettleserfanen.',
      s3: 'Resultatene finnes bare i denne fanen. Oppdaterer eller lukker du den, forsvinner de.',
    },
    gmailVerificationNote:
      'Denne utgaven er kanskje ikke godkjent av Google ennå. I så fall viser Google en advarsel, og bare testbrukere som utvikleren har lagt til, kan koble til.',
    continueGmail: 'Fortsett til Google',
    continueOutlook: 'Fortsett til Microsoft',
    preparing: 'Klargjør sikker innlogging …',
    waiting: 'Venter på at du fullfører i innloggingsvinduet …',
    notConfiguredTitle: '{provider} er ikke satt opp for denne utgaven',
    notConfiguredBody:
      'Utvikleren har ikke lagt inn en OAuth-klient-ID for {provider}. Du kan fortsatt utforske Mailmap i demomodus. Oppsettet er beskrevet i docs/PROVIDER_SETUP.md.',
    tryDemoInstead: 'Utforsk demoen i stedet',
  },
  dashboard: {
    title: 'Nyhetsbrevene dine',
    titleDemo: 'Demooversikt',
    demoBannerTitle: 'Demomodus med oppdiktede data',
    demoBannerBody:
      'Alle avsenderne her er oppdiktet. Avmeldinger blir bare simulert, og ingenting sendes noe sted. Demoen beviser ikke at tilkoblingene til Gmail eller Outlook fungerer.',
    connectedAs: 'Tilkoblet som {account}',
    connectionDemo: 'Demo, ingen konto tilkoblet',
    notConnectedTitle: 'Ingen e-postkonto tilkoblet',
    notConnectedBody:
      'Økter finnes bare i minnet, så du kobles fra når du oppdaterer siden. Koble til igjen, eller utforsk demoen.',
    readyTitle: 'Klar til å skanne',
    readyBody:
      'Mailmap leser e-posthodene i de nyeste meldingene dine, unntatt søppelpost og papirkurv, og ser etter avsendere av nyhetsbrev. Ingenting i innboksen din blir endret.',
    limitLabel: 'Meldinger som skal skannes',
    limitOption: '{count} nyeste',
    startScan: 'Start skanning',
    rescan: 'Skann på nytt',
    scanningTitle: 'Skanner e-postkontoen din',
    scanningProgress: 'Har lest {processed} av opptil {target} meldinger',
    cancelScan: 'Stopp skanning',
    partialNotice:
      'Skanningen ble stoppet tidlig. Resultatene gjelder bare de {count} meldingene som ble lest.',
    scanSummary: {
      one: 'Basert på {count} skannet melding',
      other: 'Basert på {count} skannede meldinger',
    },
    privacyPanelTitle: 'Dette kan Mailmap se',
    privacyPanelBody:
      'Bare avsender, dato og e-postlistehoder for skannede meldinger, lagret i minnet til denne fanen. Emnefelt, innhold og vedlegg blir ikke hentet.',
    privacyPanelLink: 'Alle detaljer om personvern',
  },
  stats: {
    label: 'Statistikk for skanningen',
    senders: 'Avsendere av nyhetsbrev',
    emails: 'E-poster fra nyhetsbrev',
    withUnsubscribe: 'Med avmeldingsmulighet',
    recent: 'Aktive siste 30 dager',
    disclaimer:
      'Tallene gjelder bare de skannede meldingene og omfatter ikke nødvendigvis alle abonnementene på kontoen din.',
  },
  toolbar: {
    searchLabel: 'Søk i nyhetsbrev',
    searchPlaceholder: 'Søk etter navn, adresse eller domene',
    filterLabel: 'Filter',
    sortLabel: 'Sorter etter',
    filters: {
      all: 'Alle nyhetsbrev',
      recent: 'Nylig aktive',
      'unsubscribe-available': 'Avmelding tilgjengelig',
      manual: 'Krever manuell handling',
      selected: 'Valgte',
    },
    sorts: {
      recent: 'Sist mottatt',
      count: 'Flest e-poster',
      name: 'Navn (A–Å)',
    },
    resultCount: {
      one: 'Viser {count} av {total} nyhetsbrev',
      other: 'Viser {count} av {total} nyhetsbrev',
    },
  },
  selection: {
    selectVisible: 'Velg alle som vises',
    clear: 'Fjern valg',
    count: {
      one: '{count} valgt',
      other: '{count} valgt',
    },
    bulkUnsubscribe: 'Meld av valgte',
    toolbarLabel: 'Handlinger for flere',
  },
  empty: {
    noMatchesTitle: 'Ingen nyhetsbrev passer',
    noMatchesBody: 'Prøv et annet søk eller filter.',
    clearFilters: 'Nullstill søk og filtre',
    noneFoundTitle: 'Fant ingen nyhetsbrev',
    noneFoundBody:
      'Fant ingen avsendere som ligner nyhetsbrev i de skannede meldingene. Prøv å skanne flere meldinger. Noen nyhetsbrev bruker ikke standardhoder og kan ikke oppdages.',
  },
  card: {
    select: 'Velg {name}',
    emails: {
      one: '{count} e-post',
      other: '{count} e-poster',
    },
    lastReceived: 'Sist mottatt',
    frequencyLabel: 'Anslått frekvens',
    frequency: {
      daily: 'Omtrent daglig',
      weekly: 'Omtrent ukentlig',
      monthly: 'Omtrent månedlig',
      occasional: 'Av og til',
      unknown: 'For lite data',
    },
    estimate: 'anslag',
    activity: {
      recent: 'Nylig aktiv',
      inactive: 'Ingen e-post på 30 dager',
    },
    confidence: {
      high: 'E-postlistehoder funnet',
      medium: 'Merket som masseutsendelse',
      low: 'Mulig nyhetsbrev (adressemønster)',
    },
    method: {
      'one-click': 'Ettklikks avmelding',
      web: 'Avmeldingsside',
      mailto: 'Avmelding på e-post',
      none: 'Fant ingen avmeldingsmulighet',
    },
    action: {
      'one-click': 'Meld av',
      web: 'Åpne avmeldingsside',
      mailto: 'Meld av på e-post',
      none: 'Slik melder du deg av',
      details: 'Vis detaljer',
    },
  },
  outcome: {
    sending: 'Sender forespørsel …',
    requestSent: 'Forespørsel sendt',
    requestSentHint:
      'Ikke bekreftet. Fortsetter e-postene å komme, kan du melde deg av på avsenderens nettside.',
    pageOpened: 'Siden er åpnet, fullfør der',
    manualRequired: 'Krever manuell handling: send e-posten',
    failed: {
      network: 'Kunne ikke sende forespørselen',
      timeout: 'Forespørselen tok for lang tid',
      'invalid-url': 'Usikker lenke, forespørselen ble ikke sendt',
    },
    simulated: 'Simulert (demo)',
  },
  unsubscribe: {
    title: 'Meld av {name}',
    senderLine: 'Avsender: {email}',
    oneClick: {
      heading: 'Ettklikks avmelding (RFC 8058)',
      p1: 'Nettleseren din sender én avmeldingsforespørsel direkte til {host}.',
      p2: 'Ingen innloggingsnøkler fra Google eller Microsoft og ingen informasjonskapsler blir sendt med. Avsenderen ser IP-adressen din, slik som ved et vanlig nettstedsbesøk.',
      p3: 'Nettlesere lar ikke Mailmap lese svaret fra avsenderen, så resultatet kan ikke bekreftes. Det vises som «Forespørsel sendt».',
      confirm: 'Send avmeldingsforespørsel',
    },
    web: {
      heading: 'Avmeldingsside',
      p1: 'Denne avsenderen tilbyr bare en avmeldingsside på {host}. Den åpnes i en ny fane, der du fullfører avmeldingen.',
      p2: 'Mailmap kan ikke kontrollere dette nettstedet. Ikke skriv inn passord eller betalingsopplysninger der.',
      insecure:
        'Denne lenken bruker ukryptert HTTP. Andre på nettverket ditt kan se eller endre siden.',
      open: 'Åpne {host}',
    },
    mailto: {
      heading: 'Avmelding på e-post',
      p1: 'Denne avsenderen ber deg sende en e-post til {address}.',
      p2: 'Mailmap har ikke tillatelse til å sende e-post. E-postprogrammet ditt åpnes med en ferdig utfylt melding, og du må sende den selv.',
      compose: 'Skriv e-post',
    },
    none: {
      heading: 'Fant ingen avmeldingsmulighet',
      p1: 'De skannede meldingene fra denne avsenderen har ingen brukbare avmeldingshoder.',
      tip1: 'Åpne en nylig e-post fra avsenderen og se etter en avmeldingslenke nederst.',
      tip2: 'Gmail og Outlook kan også blokkere en avsender eller filtrere e-postene.',
      tip3: 'Har du aldri meldt deg på, kan du merke e-posten som søppelpost i e-postprogrammet ditt.',
    },
    rejected: {
      one: '{count} lenke fra denne avsenderen ble ignorert fordi den så usikker ut.',
      other: '{count} lenker fra denne avsenderen ble ignorert fordi de så usikre ut.',
    },
    alternativesTitle: 'Andre muligheter fra denne avsenderen',
    demoNote: 'Demomodus: ingenting blir sendt eller åpnet. Handlingen blir bare simulert.',
    simulate: 'Simuler',
  },
  bulk: {
    title: 'Meld av {count} nyhetsbrev',
    intro: 'Se gjennom hva som skjer med hvert valgte nyhetsbrev før du bekrefter.',
    oneClickTitle: 'Sendes automatisk når du bekrefter',
    oneClickNote:
      'Én forespørsel per avsender går direkte fra nettleseren din til avsenderen. Resultatene kan ikke bekreftes.',
    manualTitle: 'Krever handling fra deg',
    manualNote:
      'Disse avsenderne krever at du åpner en side eller sender en e-post. Bruk knappene nedenfor.',
    unavailableTitle: 'Fant ingen avmeldingsmulighet',
    confirm: {
      one: 'Send {count} forespørsel',
      other: 'Send {count} forespørsler',
    },
    confirmDemo: {
      one: 'Simuler {count} forespørsel',
      other: 'Simuler {count} forespørsler',
    },
    nothingAutomatic: 'Ingen av de valgte nyhetsbrevene støtter ettklikks avmelding.',
    resultsTitle: 'Resultater',
    done: 'Ferdig',
  },
  account: {
    menuLabel: 'Kontomeny',
    privacy: 'Personvern',
    disconnect: 'Koble fra',
    exitDemo: 'Avslutt demo',
    revokeGmail: 'Når du kobler fra, trekkes Mailmaps tilgangsnøkkel hos Google tilbake.',
    revokeOutlook:
      'Når du kobler fra, slettes nøklene i denne fanen. Samtykket fjerner du i innstillingene for Microsoft-kontoen din.',
  },
  errors: {
    title: 'Noe gikk galt',
    'not-configured': 'Denne leverandøren er ikke satt opp for denne utgaven.',
    'script-load-failed':
      'Innloggingsbiblioteket kunne ikke lastes. Sjekk nettforbindelsen eller innholdsblokkere.',
    'popup-blocked':
      'Innloggingsvinduet ble blokkert. Tillat popup-vinduer for dette nettstedet og prøv igjen.',
    cancelled: 'Innloggingen ble avbrutt.',
    'consent-denied': 'Tilgang ble ikke gitt. Mailmap kan ikke skanne uten lesetilgang.',
    'scope-missing':
      'Gmail-tillatelsen ble ikke gitt. Huk av for tillatelsen i Google-vinduet for å fortsette.',
    unauthorized: 'Økten har utløpt. Koble til igjen for å fortsette.',
    forbidden: 'Leverandøren avviste forespørselen. Kontoen tillater kanskje ikke denne appen.',
    'rate-limited':
      'Leverandøren begrenser antall forespørsler akkurat nå. Vent et minutt og prøv igjen.',
    network: 'Nettverksfeil. Sjekk forbindelsen og prøv igjen.',
    server: 'Leverandøren returnerte en feil. Prøv igjen senere.',
    'headers-unavailable':
      'Microsoft returnerte meldinger uten e-posthoder, så nyhetsbrev kan ikke oppdages. Tillatelsen Mail.ReadBasic omfatter kanskje ikke e-posthoder. Bruk Mail.Read (se oppsettsveiledningen).',
    unknown: 'Det oppstod en uventet feil.',
    reconnect: 'Koble til igjen',
  },
  privacy: {
    title: 'Personvern',
    intro:
      'Denne siden beskriver hva Mailmap-koden i dette kodelageret faktisk gjør. Bruker du en kopi som noen andre drifter, kan de ha endret den.',
    permissionsTitle: 'Tillatelser Mailmap ber om',
    permissionsGmail:
      'Gmail: https://www.googleapis.com/auth/gmail.metadata, som omfatter etiketter, historikk og e-posthoder, men ikke innhold eller vedlegg. Google regner dette som et begrenset omfang.',
    permissionsOutlook:
      'Outlook: Mail.Read som standard, i tillegg til de vanlige innloggingstillatelsene (openid, profile, offline_access). Mail.Read ville gitt tilgang til meldingsinnhold. Mailmap ber ikke om det, men tillatelsen i seg selv hindrer det ikke. En utgave kan bytte til Mail.ReadBasic; se dokumentasjonen.',
    retrievedTitle: 'Hva som hentes',
    retrievedBody:
      'For hver skannede melding: en intern meldings-ID, mottaksdato, avsenderens navn og adresse, og disse hodene hvis de finnes: List-Unsubscribe, List-Unsubscribe-Post, List-Id, Precedence og Authentication-Results. Outlook returnerer også mappe-ID, slik at søppelpost og slettede elementer kan hoppes over. Gmail-adressen din, eller navnet på Microsoft-kontoen din, vises i toppfeltet.',
    bodiesTitle: 'Blir meldingsinnhold lest?',
    bodiesBody:
      'Nei. Mailmap ber aldri om emnefelt, innhold, forhåndsvisning eller vedlegg. For Gmail gir tillatelsen ikke tilgang til dette. For Outlook velger Mailmaps forespørsler uttrykkelig bare feltene som er nevnt over.',
    processingTitle: 'Hvor dataene behandles',
    processingBody:
      'Kun i nettleseren din. Mailmap har ingen egen server og ingen database. Nettleseren din kommuniserer direkte med Google (gmail.googleapis.com, accounts.google.com) eller Microsoft (graph.microsoft.com, login.microsoftonline.com).',
    storageTitle: 'Hva som lagres, og hvor lenge',
    storageBody:
      'Skanneresultater og tilgangsnøkler finnes bare i minnet til denne fanen. Microsofts innloggingsbibliotek lagrer innloggingsstatus kortvarig i øktlagringen mens innloggingsvinduet er åpent. Språkvalget ditt lagres i lokal lagring. Ingenting annet blir lagret.',
    refreshTitle: 'Når du oppdaterer eller lukker fanen',
    refreshBody:
      'Alt i minnet forsvinner: skanneresultater, valg, avmeldingsstatus og tilgangsnøkler. Du må koble til på nytt.',
    thirdPartiesTitle: 'Hvem andre som mottar data',
    thirdPartiesBody:
      'Google eller Microsoft, som du kobler til og som allerede har e-posten din. Avsendere av nyhetsbrev, bare når du bekrefter en avmelding: de mottar en forespørsel fra IP-adressen din, eller du åpner siden deres, eller du sender dem en e-post. Mailmap bruker ingen analyse, reklame eller sporingsskript, og skrifttypen leveres fra dette nettstedet.',
    disconnectTitle: 'Koble fra og trekke tilbake tilgang',
    disconnectBody:
      'Bruk «Koble fra» i kontomenyen. For Gmail trekkes også tilgangsnøkkelen tilbake hos Google. For Outlook slettes nøklene i denne fanen.',
    revokeGoogle: 'Fjern Mailmaps tilgang i Google-kontoen din',
    revokeMicrosoft: 'Administrer apptillatelser for din personlige Microsoft-konto',
    revokeWork:
      'Jobb- eller skolekontoer: gå til Mine apper (myapps.microsoft.com) eller kontakt administratoren din.',
    limitsTitle: 'Begrensninger',
    limitsBody:
      'Gjenkjenningen er basert på tommelfingerregler og gjelder bare skannede meldinger. Resultatet av avmeldinger kan ikke bekreftes. Avmeldingslenker kommer fra e-poster som hvem som helst kan sende, så Mailmap filtrerer bort usikre lenker, men kan ikke gå god for noe nettsted.',
  },
  notFound: {
    title: 'Fant ikke siden',
    body: 'Siden du leter etter, finnes ikke.',
    home: 'Gå til forsiden',
  },
};

export default nb;
