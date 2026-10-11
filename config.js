/**
 * CONFIGURAZIONE MONETIZZAZIONE & PARAMETRI — FINCALCOLATORE
 * 
 * 💡 COME FUNZIONA L'ORDINAMENTO DEI BROKER:
 * - Modifica il campo 'priority': i broker con priorità più bassa (1, 2, 3...) vengono messi automaticamente IN ALTO!
 * - Quando una promozione cambia (es. una banca offre 50€ invece di 20€), basta impostare 'priority: 1'
 *   per far comparire quel broker al primo posto in cima alla pagina.
 * - Per i codici promo: se inserisci un codice nel campo 'promoCode', la card mostrerà automaticamente
 *   il riquadro del codice con il pulsante interattivo "Copia" per l'utente!
 */

const APP_CONFIG = {
  // Impostazioni Generali
  appName: "FinCalcolatore",
  appUrl: "https://jaco-afk469.github.io/calcolatore-fire/",
  defaultCurrency: "€",

  // 1. MONETIZZAZIONE AFFILIAZIONI & BROKER PARTNER
  affiliates: {
    enabled: true,
    showDisclaimers: true,
    partners: [
      {
        id: "trade_republic",
        name: "Trade Republic",
        priority: 1, // ⭐ PRIORITÀ 1: Posizionato in cima in alto
        promoCode: "TRPAC20", // Codice invito: mostra il box e il tasto "Copia"
        payoutNote: "Fino a 40€ per nuovo conto",
        logo: "assets/logos/trade-republic.jpg",
        category: "Broker & Rendimento Liquidità",
        ratingScore: "4.9",
        ratingStars: "★★★★★",
        ratingLabel: "Scelta Top",
        ctaText: "Inizia con Trade Republic",
        url: "https://traderepublic.com/",
        specs: [
          { label: "Canone Conto", value: "0,00 €", highlight: true },
          { label: "Ordini PAC", value: "0,00 €", highlight: true },
          { label: "Liquidità", value: "3,25% lordo", highlight: true }
        ],
        pros: [
          "<strong>Piani di accumulo gratuiti:</strong> investi in automatico su oltre 2.000 ETF senza commissioni d'acquisto",
          "<strong>Interessi mensili sul saldo:</strong> remunerazione costante sulla liquidità non investita depositata sul conto",
          "<strong>Saveback 1% sulla carta:</strong> cashback sugli acquisti quotidiani reinvestito direttamente nel tuo ETF"
        ],
        perkTag: "MIGLIOR PAC",
        perkText: "Interesse 3.25% + Piani ETF a 0€"
      },
      {
        id: "satispay",
        name: "Satispay",
        priority: 2, // ⭐ PRIORITÀ 2
        promoCode: "FRP486", // Tuo codice invito Satispay
        payoutNote: "Fino a 50€ a invito durante le promo",
        logo: "assets/logos/satispay.svg",
        category: "Pagamenti & Salvadanai Smart",
        ratingScore: "4.9",
        ratingStars: "★★★★★",
        ratingLabel: "Scelta Utenti",
        ctaText: "Scarica Satispay con Bonus",
        url: "https://web.satispay.com/promocode/249c9a89-2d95-4be2-97be-635827f1ce91",
        specs: [
          { label: "Canone", value: "0,00 €", highlight: true },
          { label: "Salvadanaio", value: "Gratuito", highlight: true },
          { label: "Cashback", value: "Fino a 20%", highlight: false }
        ],
        pros: [
          "<strong>Salvadanaio automatico:</strong> arrotondamento delle spese al centesimo e accumulo settimanale senza sforzo",
          "<strong>Zero commissioni:</strong> scambi di denaro istantanei P2P tra amici e pagamenti nei negozi convenzionati",
          "<strong>Bonus di benvenuto:</strong> ricevi l'accredito promozionale esclusivo inserendo il codice invito"
        ],
        perkTag: "PROMO ATTIVA",
        perkText: "Bonus di benvenuto immediato con codice"
      },
      {
        id: "buddybank",
        name: "buddybank (UniCredit)",
        priority: 3, // ⭐ PRIORITÀ 3
        promoCode: "BUDDY50", // Codice amico UniCredit
        payoutNote: "Fino a 30€-50€ bonus UniCredit",
        logo: "assets/logos/buddybank.jpg",
        category: "Banca Digitale UniCredit",
        ratingScore: "4.7",
        ratingStars: "★★★★★",
        ratingLabel: "Molto Buono",
        ctaText: "Scopri buddybank",
        url: "https://www.buddybank.com/",
        specs: [
          { label: "Canone Base", value: "0,00 €", highlight: true },
          { label: "Bonifici SEPA", value: "0,00 €", highlight: true },
          { label: "Prelievi UniCredit", value: "Gratuiti", highlight: true }
        ],
        pros: [
          "<strong>Assistenza h24 via chat:</strong> concierge bancario dedicato disponibile in chat 24 ore su 24, 7 giorni su 7",
          "<strong>Carta di debito inclusa:</strong> carta internazionale a canone zero collegabile ad Apple Pay e Google Pay",
          "<strong>Solidità UniCredit:</strong> conto corrente protetto dal Fondo Interbancario di Tutela dei Depositi (FITD)"
        ],
        perkTag: "PROMO INVITO",
        perkText: "Bonus benvenuto con codice amico"
      },
      {
        id: "hype",
        name: "HYPE (Banca Sella)",
        priority: 4, // ⭐ PRIORITÀ 4
        promoCode: "PLUS10", // Codice promo HYPE
        payoutNote: "Fino a 25€ per apertura conto",
        logo: "assets/logos/hype.png",
        category: "Conto Online Italiano con IBAN",
        ratingScore: "4.8",
        ratingStars: "★★★★★",
        ratingLabel: "Molto Buono",
        ctaText: "Registrati su HYPE a 0€",
        url: "https://www.hype.it/invite/09ea7f1fbe14783449b453f0dba2ea6ba383a73fea2a6fdb21b5c2f14b7f2d1ab62fac0d",
        specs: [
          { label: "Canone Annuo", value: "0,00 €", highlight: true },
          { label: "Bonifici", value: "0,00 €", highlight: true },
          { label: "Carta Spesa", value: "Inclusa", highlight: false }
        ],
        pros: [
          "<strong>Apertura rapida:</strong> conto attivabile al 100% online in 5 minuti senza documenti cartacei",
          "<strong>Sezione Risparmi:</strong> crea obiettivi dedicati e salvadanai digitali con trasferimenti periodici",
          "<strong>Sicurezza Banca Sella:</strong> deposito protetto dal Fondo Interbancario di Tutela dei Depositi (FITD)"
        ],
        perkTag: "BONUS ATTIVO",
        perkText: "Bonus benvenuto all'apertura conto"
      },
      {
        id: "isybank",
        name: "isybank (Intesa Sanpaolo)",
        priority: 5, // ⭐ PRIORITÀ 5
        promoCode: "ISY30", // Codice amico Isybank
        payoutNote: "Buono Amazon 30€ con promo porta un amico",
        logo: "assets/logos/isybank.svg",
        category: "Banca Digitale Intesa Sanpaolo",
        ratingScore: "4.7",
        ratingStars: "★★★★★",
        ratingLabel: "Molto Buono",
        ctaText: "Scopri isybank",
        url: "https://www.isybank.com/",
        specs: [
          { label: "Canone isyLight", value: "0,00 €", highlight: true },
          { label: "Bonifici SEPA", value: "0,00 €", highlight: true },
          { label: "Prelievi Intesa", value: "Gratuiti", highlight: true }
        ],
        pros: [
          "<strong>Tutto in app:</strong> apertura 100% digitale in pochi minuti con SPID o documento d'identità",
          "<strong>Salvadanaio digitale:</strong> imposta somme periodiche e arrotonda le spese per accantonare risparmi",
          "<strong>Solidità Intesa Sanpaolo:</strong> la sicurezza del primo gruppo bancario italiano a canone azzerato"
        ],
        perkTag: "BUONO REGALO",
        perkText: "Buono regalo Amazon con codice amico"
      },
      {
        id: "scalable_capital",
        name: "Scalable Capital",
        priority: 6, // ⭐ PRIORITÀ 6
        promoCode: "", // Nessun codice testuale: mostra l'offerta PAC
        payoutNote: "Commissione su primo deposito/PAC",
        logo: "assets/logos/scalable-capital.svg",
        category: "Broker ETF & Azioni",
        ratingScore: "4.7",
        ratingStars: "★★★★★",
        ratingLabel: "Miglior Scelta ETF",
        ctaText: "Scopri Scalable Capital",
        url: "https://scalable.capital/",
        specs: [
          { label: "Canone FREE", value: "0,00 €", highlight: true },
          { label: "PAC ETF", value: "Gratuiti", highlight: true },
          { label: "ETF Disponibili", value: "2.500+", highlight: false }
        ],
        pros: [
          "<strong>Zero costi fissi di gestione:</strong> piano di accumulo personalizzabile a partire da soli 1€ al mese",
          "<strong>Oltre 2.500 ETF:</strong> la più ampia selezione europea tra i migliori emittenti (iShares, Xtrackers, Amundi)",
          "<strong>Interesse sul conto:</strong> rendimento vantaggioso sulla liquidità non investita con il piano PRIME"
        ],
        perkTag: "OFFERTA PAC",
        perkText: "Oltre 2.500 ETF a commissioni 0€"
      }
    ]
  },

  // 2. GOOGLE ADSENSE & PUBBLICITÀ DISPLAY (Facoltativo)
  advertising: {
    enabled: false,
    adSenseClientId: "ca-pub-XXXXXXXXXXXXXXXX",
    slots: {
      topBanner: "1234567890",
      inContent: "2345678901",
      sidebarSticky: "3456789012"
    }
  },

  // 3. DONAZIONI & MICRO-PAGAMENTI (Facoltativo)
  donations: {
    enabled: false,
    buyMeACoffeeUsername: "",
    stripePaymentLink: ""
  }
};

// Esporta la configurazione globalmente
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
