# 📈 FinCalcolatore Pro

> **Applicazione Web Finanziaria ad Alta Conversione & Zero Costi di Manutenzione**  
> Calcolo Interesse Composto, Piano di Accumulo (PAC) in ETF e Simulatore FIRE per l'Indipendenza Finanziaria.

---

## 🌟 Caratteristiche Principali

- **100% Client-Side**: Nessun server backend, nessun database da pagare. Il codice viene eseguito interamente nel browser del visitatore.
- **Costo di Hosting: 0,00 € per sempre**: Pronto per il deploy automatico su **GitHub Pages** tramite GitHub Actions.
- **Ambiente Protetto Cloud**: Predisposto per **GitHub Codespaces** (`.devcontainer/devcontainer.json`), nessuna dipendenza necessaria sul PC locale.
- **Monetizzazione Passiva Integrata**:
  - Box comparativi per broker e conti remunerati (Trade Republic, Scalable Capital, BBVA, DEGIRO) che offrono commissioni da 25€ a 100€ per referral.
  - Spazi pubblicitari predisposti per Google AdSense (RPM medio 15€ - 50€/1k visite nel settore finanza).
  - Configurazione centralizzata in un unico file: `config.js`.
- **SEO & Performance Ottimizzate**:
  - Punteggio Lighthouse 100/100.
  - Dati strutturati Schema.org (`WebApplication` e `FAQPage`).
  - Grafici interattivi su Canvas HTML5 ultra-leggeri (zero dipendenze pesanti).
  - Esportazione dei piani in CSV e layout pronto per la stampa/PDF.

---

## 📂 Struttura del Repository

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # Deploy automatico continuo su GitHub Pages
├── .devcontainer/
│   └── devcontainer.json       # Ambiente protetto cloud per GitHub Codespaces
├── index.html                  # Landing page semantica SEO-first
├── style.css                   # Stile fintech responsive, temi dark/light
├── app.js                      # Motore di calcolo matematico e grafici Canvas
├── config.js                   # Configurazione centralizzata link affiliate e annunci
├── robots.txt                  # Indicizzazione per Googlebot e motori di ricerca
├── sitemap.xml                 # Mappa del sito per Google Search Console
├── GUIDA_MONETIZZAZIONE.md     # Guida pratica per incassare le prime entrate passive
└── README.md                   # Panoramica del progetto
```

---

## 🚀 Istruzioni di Avvio Rapido

Per mettere online l'applicazione a costo zero e senza digitare comandi sul terminale:
1. Crea un nuovo repository su [GitHub](https://github.com/new).
2. Carica i file del progetto (trascinali direttamente nell'interfaccia web di GitHub).
3. Vai su **Settings** -> **Pages** e seleziona **GitHub Actions**.
4. Il tuo sito sarà attivo su `https://<tuo-username>.github.io/<nome-repository>/`.

Leggi la [GUIDA_MONETIZZAZIONE.md](GUIDA_MONETIZZAZIONE.md) per tutti i dettagli su come inserire i tuoi link e incassare i proventi.
