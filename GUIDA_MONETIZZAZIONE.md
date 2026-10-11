# 💰 Guida Completa alla Monetizzazione Passiva a Costo Zero

Benvenuto nel tuo nuovo asset digitale: **FinCalcolatore Pro**.
Questo progetto è stato ingegnerizzato appositamente per rispettare tre vincoli fondamentali:
1. **Costo di mantenimento: 0,00 € per sempre** (nessun hosting o server a pagamento).
2. **Manutenzione: Zero interventi manuali** (logica 100% client-side nel browser del visitatore).
3. **Ambiente protetto**: Nessun comando rischioso eseguito sul tuo computer; pubblicazione via cloud su GitHub.

---

## 🚀 PARTE 1: Come Pubblicare il Sito Online Gratis su GitHub Pages (2 Minuti)

Non serve digitare nessun comando sul tuo terminale locale. Puoi fare tutto direttamente dal browser:

1. **Accedi a GitHub**: Vai su [github.com](https://github.com) e accedi al tuo account.
2. **Crea un Nuovo Repository**:
   - Clicca sul pulsante verde **"New"** (oppure vai su [github.com/new](https://github.com/new)).
   - Dai un nome al repository, ad esempio: `calcolatore-fire` o `fin-calculator`.
   - Imposta il repository come **Public** (necessario per GitHub Pages gratuito).
   - Clicca su **"Create repository"**.
3. **Carica i File del Progetto**:
   - Nella schermata del repository appena creato, clicca sul link **"uploading an existing file"**.
   - Trascina tutti i file di questa cartella (`index.html`, `style.css`, `app.js`, `config.js`, `robots.txt`, `sitemap.xml` e la cartella `.github`).
   - Clicca sul pulsante verde **"Commit changes"**.
4. **Attiva GitHub Pages**:
   - Vai nella scheda **Settings** del tuo repository su GitHub.
   - Nella barra laterale sinistra, clicca su **Pages** (sotto la sezione *Code and automation*).
   - Alla voce **Source**, seleziona **GitHub Actions** (oppure seleziona *Deploy from a branch* -> `main` -> `/root`).
   - Clicca su **Save**.
5. **Fatto! Il tuo sito è online!**
   - Entro 60 secondi il tuo sito sarà pubblico e raggiungibile all'indirizzo:
     `https://<tuo-username>.github.io/<nome-repository>/` con certificato di sicurezza HTTPS già attivo.

---

## 💸 PARTE 2: Come Monetizzare (I Tuoi Canali di Guadagno Passivo)

La nicchia **Finanza Personale & Investimenti** è storicamente la più redditizia di tutto il web. Le piattaforme pagano cifre elevate perché il valore di ogni cliente acquisito è molto alto.

### 1. Affiliazioni Finanziarie Dirette (Il canale più veloce e remunerativo)
Puoi guadagnare inserendo i tuoi link referral personali o iscrivendoti ai programmi partner ufficiali:

| Piattaforma | Tipo di Servizio | Guadagno per Utente | Dove Iscriversi |
| :--- | :--- | :--- | :--- |
| **Trade Republic** | Broker PAC ETF e Conto Remunerato | **25€ - 50€** per registrazione | Dall'app Trade Republic (sezione "Invita amici") o tramite il network [FinanceAds](https://www.financeads.net) |
| **Scalable Capital** | Broker Europeo ETF senza commissioni | **30€ - 70€** per account attivo | Programma Affiliati Scalable o [Awin](https://www.awin.com) |
| **Conto BBVA** | Conto Remunerato e Liquidità al 4% | **20€ - 40€** per conto aperto | Dall'app BBVA (sezione "Passaparola") |
| **DEGIRO** | Broker Azionario Globale | **25€ - 50€** in voucher/cash | Piattaforma DEGIRO Referral |

#### Come inserire i tuoi link:
Apri il file `config.js` e sostituisci gli URL di esempio con i tuoi link reali:
```javascript
{
  id: "trade_republic",
  url: "https://traderepublic.com/referral/IL_TUO_LINK_QUI",
  ...
}
```
Salva il file e fai il commit: tutti i pulsanti sul sito si aggiorneranno istantaneamente da soli.

---

### 2. Google AdSense (Pubblicità Display Passiva)
Una volta che il sito comincia a registrare visitatori:
1. Registrati gratuitamente su [google.com/adsense](https://www.google.com/adsense).
2. Aggiungi il dominio del tuo sito.
3. Nel file `config.js`, imposta:
   ```javascript
   advertising: {
     enabled: true,
     adSenseClientId: "ca-pub-IL_TUO_ID_QUI",
     ...
   }
   ```
4. I banner appariranno automaticamente negli spazi predisposti senza rovinare l'esperienza d'uso. Nel settore finanza, il guadagno medio (RPM) va da **15€ a 50€ ogni 1.000 visualizzazioni**.

---

### 3. Donazioni e Micro-Transazioni
Nel file `config.js` puoi inserire il tuo username di **Buy Me a Coffee** o un link **Stripe** per chi desidera supportare lo strumento gratuitamente.

---

## 📈 PARTE 3: Come Ottenere Visite Gratuite Senza Spendere in Pubblicità

Il calcolatore è già ottimizzato per i motori di ricerca con:
- **Dati Strutturati Schema.org** (`WebApplication` e `FAQPage` per apparire nei riquadri in evidenza di Google).
- **Tag Title e Meta Description** tarati sulle parole chiave a maggior volume di ricerca:
  - *"calcolo interesse composto pac"* (oltre 20.000 ricerche mensili in Italia)
  - *"simulatore fire pensione anticipata"*
  - *"calcolatore piano di accumulo etf"*

### Strategie Gratuite per il Lancio Iniziale:
1. **Reddit (r/ItaliaPersonalFinance)**: È la community finanziaria più attiva in Italia (oltre 150.000 membri). Condividi il calcolatore come risorsa gratuita open-source per simulare la regola del 4% e i piani di accumulo. I feedback e il traffico iniziale saranno immediati.
2. **Gruppi Telegram e Forum di Finanza (FinanzaOnline)**: Presenta il tool come calcolatore veloce, senza pubblicità invasive e utilizzabile da smartphone.
3. **Google Search Console**: Registra il sito su [search.google.com/search-console](https://search.google.com/search-console) e invia la sitemap (`sitemap.xml`) per essere indicizzato da Google in 24-48 ore.

---

## 🛡️ PARTE 4: Manutenzione Zero Garantita
- Il sito è composto da **puro codice statico** (HTML, CSS moderno e JavaScript vanilla).
- Non esiste un database che possa corrompersi o richiedere backup.
- Non esiste un server backend da aggiornare o pagare a fine mese.
- I calcoli matematici sono immutabili nel tempo: una volta online, il sito continua a funzionare 24 ore su 24 per anni senza alcun bisogno del tuo intervento.
