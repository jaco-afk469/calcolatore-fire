/**
 * CONFIGURAZIONE MONETIZZAZIONE & PARAMETRI
 * Modifica questo file per inserire i tuoi codici di affiliazione e pubblicità.
 * Non devi toccare nessun altro file per guadagnare!
 */

const APP_CONFIG = {
  // Impostazioni Generali
  appName: "FinCalcolatore Pro",
  appUrl: "https://jaco-afk469.github.io/calcolatore-fire/",
  defaultCurrency: "€",

  // 1. MONETIZZAZIONE AFFILIAZIONI & REFERRAL "INVITA UN AMICO"
  affiliates: {
    enabled: true,
    showDisclaimers: true,
    partners: [
      {
        id: "satispay",
        name: "Satispay",
        tagline: "L'app leader in Italia per pagamenti smart, salvadanai di risparmio automatico e cashback",
        bonusText: "Bonus di benvenuto esclusivo per i nuovi iscritti",
        rating: "4.9 ★★★★★",
        category: "Miglior App Risparmio & Salvadanaio",
        ctaText: "Scarica Satispay con Bonus",
        url: "https://web.satispay.com/promocode/249c9a89-2d95-4be2-97be-635827f1ce91", // Sostituisci con il tuo link invito SATISPAY
        promoCode: "FRP486", // Inserisci il tuo codice invito SATISPAY
        badge: "Salvadanaio Smart"
      },
      {
        id: "hype",
        name: "HYPE (Banca Sella)",
        tagline: "Conto e carta a canone zero con IBAN italiano, ricariche istantanee e salvadanaio automatico",
        bonusText: "Bonus Benvenuto: apri il conto gratuito e ricevi il bonus promo",
        rating: "4.8 ★★★★★",
        category: "Conto & Carta a Canone 0€",
        ctaText: "Registrati su HYPE a 0€",
        url: "https://www.hype.it/invite/09ea7f1fbe14783449b453f0dba2ea6ba383a73fea2a6fdb21b5c2f14b7f2d1ab62fac0d",
        promoCode: "",
        badge: "Zero Spese"
      },
      {
        id: "trade_republic",
        name: "Trade Republic",
        tagline: "Interesse 3.25% remunerato sulla liquidità + Piani di Accumulo ETF a zero commissioni",
        bonusText: "Bonus di benvenuto: fino a 20€ in azioni frazionate",
        rating: "4.9 ★★★★★",
        category: "Miglior Broker per PAC ETF",
        ctaText: "Inizia con Trade Republic",
        url: "https://traderepublic.com/",
        badge: "Più Consigliato"
      },
      {
        id: "scalable_capital",
        name: "Scalable Capital",
        tagline: "Broker europeo per investimenti a lungo termine con oltre 2.500 ETF a zero commissioni fisse",
        bonusText: "Piani di accumulo gratuiti e tassi vantaggiosi",
        rating: "4.7 ★★★★★",
        category: "Ideale per ETF e Azioni",
        ctaText: "Scopri Scalable Capital",
        url: "https://scalable.capital/",
        badge: "Zero Commissioni"
      }
    ]
  },

  // 2. GOOGLE ADSENSE & PUBBLICITÀ DISPLAY
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
    enabled: true,
    buyMeACoffeeUsername: "",
    stripePaymentLink: ""
  }
};

// Esporta la configurazione globalmente
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
