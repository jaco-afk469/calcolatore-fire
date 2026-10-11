/**
 * CONFIGURAZIONE MONETIZZAZIONE & PARAMETRI
 * Modifica questo file per inserire i tuoi codici di affiliazione e pubblicità.
 * Non devi toccare nessun altro file per guadagnare!
 */

const APP_CONFIG = {
  // Impostazioni Generali
  appName: "FinCalcolatore Pro",
  appUrl: "https://tuo-username.github.io/app-per-monetizzare",
  defaultCurrency: "€",

  // 1. MONETIZZAZIONE AFFILIAZIONI (I broker e le banche che ti pagano a conversione)
  // Sostituisci gli URL di esempio con i tuoi link referral personali o da reti come FinanceAds/Awin
  affiliates: {
    enabled: true,
    showDisclaimers: true,
    partners: [
      {
        id: "trade_republic",
        name: "Trade Republic",
        tagline: "Interesse 3.25% sulla liquidità + Piani di Accumulo a 0€",
        bonusText: "Bonus di benvenuto: fino a 20€ in azioni frazionate",
        rating: "4.9 ★★★★★",
        category: "Miglior Broker per PAC ETF",
        ctaText: "Inizia con Trade Republic",
        url: "https://traderepublic.com/referral/IL_TUO_CODICE", // Inserisci il tuo link referral
        badge: "Più Consigliato"
      },
      {
        id: "scalable_capital",
        name: "Scalable Capital",
        tagline: "Broker europeo con oltre 2.500 ETF a zero commissioni fisse",
        bonusText: "Piani di accumulo gratuiti e tassi vantaggiosi",
        rating: "4.8 ★★★★★",
        category: "Ideale per ETF e Azioni",
        ctaText: "Scopri Scalable Capital",
        url: "https://scalable.capital/referral/IL_TUO_CODICE", // Inserisci il tuo link referral
        badge: "Zero Commissioni"
      },
      {
        id: "bbva",
        name: "Conto BBVA",
        tagline: "4% di remunerazione sul conto corrente senza vincoli + cashback",
        bonusText: "Canone 0€ per sempre e bonifici istantanei gratuiti",
        rating: "4.8 ★★★★★",
        category: "Miglior Conto Deposito / Liquidità",
        ctaText: "Apri Conto BBVA a 0€",
        url: "https://www.bbva.it/promo/IL_TUO_CODICE", // Inserisci il tuo link referral
        badge: "Rendimento Garantito"
      },
      {
        id: "degiro",
        name: "DEGIRO",
        tagline: "Accesso a oltre 50 borse globali con commissioni bassissime",
        bonusText: "Selezione core di ETF popolari senza costi di transazione",
        rating: "4.7 ★★★★★",
        category: "Broker per Investitori Avanzati",
        ctaText: "Registrati su DEGIRO",
        url: "https://www.degiro.it/referral/IL_TUO_CODICE",
        badge: "Ampia Scelta"
      }
    ]
  },

  // 2. GOOGLE ADSENSE & PUBBLICITÀ DISPLAY
  // Quando vieni approvato da Google AdSense o EthicalAds, inserisci qui i tuoi ID
  advertising: {
    enabled: false, // Imposta a true appena hai un account Google AdSense approvato
    adSenseClientId: "ca-pub-XXXXXXXXXXXXXXXX", // Inserisci il tuo ID publisher AdSense
    slots: {
      topBanner: "1234567890",
      inContent: "2345678901",
      sidebarSticky: "3456789012"
    }
  },

  // 3. DONAZIONI & MICRO-PAGAMENTI (Facoltativo)
  donations: {
    enabled: true,
    buyMeACoffeeUsername: "tuo_username", // es. 'mario' su buymeacoffee.com/mario
    stripePaymentLink: "" // opzionale: link diretto Stripe per offerte libere
  }
};

// Esporta la configurazione globalmente
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
