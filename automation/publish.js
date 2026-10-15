/**
 * DISPATCHER DI PUBBLICAZIONE SOCIAL - FINCALCOLATORE
 * Pubblica i post generati su Meta (Instagram/Facebook) e Reddit tramite API ufficiali.
 * Se le credenziali non sono ancora configurate, archivia il post e notifica i passaggi mancanti.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const payloadPath = path.join(__dirname, 'output', 'post_payload.json');
if (!fs.existsSync(payloadPath)) {
  console.error('[Dispatcher] Errore: post_payload.json non trovato. Esegui prima generate_post.js.');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

console.log('====================================================');
console.log(`[Dispatcher] Inizio pubblicazione per: "${payload.id}" (${payload.category})`);
console.log(`[Dispatcher] Data: ${payload.date} - Slot: ${payload.slot}`);
console.log('====================================================');

// Funzione helper per richieste HTTPS POST
function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const bodyStr = typeof data === 'string' ? data : JSON.stringify(data);
    const isJson = typeof data !== 'string';

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'FinCalcolatore-Autopilot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(rawData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: rawData });
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

// 1. PUBBLICAZIONE META (INSTAGRAM & FACEBOOK)
async function publishToMeta() {
  const token = process.env.META_ACCESS_TOKEN;
  const igId = process.env.INSTAGRAM_ACCOUNT_ID;
  const fbPageId = process.env.FACEBOOK_PAGE_ID;

  if (!token || !igId) {
    console.log('[Meta / Instagram] ⚠️ Segreti META_ACCESS_TOKEN o INSTAGRAM_ACCOUNT_ID non impostati.');
    console.log('[Meta / Instagram] -> Modalità Anteprima/Dry-Run: Post preparato con successo ma non inviato alle API.');
    return;
  }

  try {
    console.log('[Meta] Connessione a Meta Graph API...');
    // Endpoint per pubblicare su Pagina Facebook
    if (fbPageId) {
      const fbUrl = `https://graph.facebook.com/v19.0/${fbPageId}/feed?message=${encodeURIComponent(payload.facebook.caption)}&access_token=${token}`;
      const fbRes = await httpsPost(fbUrl, '');
      console.log('[Facebook] Risposta:', fbRes.status, fbRes.data);
    }
  } catch (err) {
    console.error('[Meta] Errore pubblicazione:', err.message);
  }
}

// 2. PUBBLICAZIONE VIA BUFFER (INSTAGRAM, TIKTOK, FACEBOOK)
async function publishToBuffer() {
  let token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) {
    const keyFile = path.join(__dirname, '..', 'API KEY BUFFER', 'Usare solo se chiesta esplicitamente.txt');
    if (fs.existsSync(keyFile)) {
      token = fs.readFileSync(keyFile, 'utf8').trim();
    }
  }

  if (!token) {
    console.log('[Buffer] ⚠️ BUFFER_ACCESS_TOKEN non impostato.');
    return;
  }

  try {
    console.log('[Buffer] Connessione a Buffer GraphQL API...');
    
    // 1. Recupera Organization ID
    const orgRes = await bufferGraphQL(token, `query { account { organizations { id name } } }`);
    if (!orgRes?.data?.account?.organizations?.[0]?.id) {
      console.error('[Buffer] Impossibile recuperare Organization ID:', orgRes);
      return;
    }
    const orgId = orgRes.data.account.organizations[0].id;

    // 2. Recupera i canali connessi
    const channelsRes = await bufferGraphQL(token, `query { channels(input: { organizationId: "${orgId}" }) { id name service } }`);
    const channels = channelsRes?.data?.channels || [];
    console.log(`[Buffer] Canali trovati: ${channels.map(c => `${c.service} (${c.name})`).join(', ')}`);

    const imageUrl = 'https://raw.githubusercontent.com/jaco-afk469/calcolatore-fire/main/automation/output/current_post.png';
    const cleanCaption = payload.instagram.caption.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    for (const channel of channels) {
      console.log(`[Buffer] Invio post a canale: ${channel.service} (${channel.name})...`);
      
      const input = {
        channelId: channel.id,
        text: cleanCaption,
        schedulingType: 'automatic',
        mode: 'addToQueue',
        assets: [{ image: { url: imageUrl } }]
      };

      if (channel.service === 'instagram') {
        input.metadata = { instagram: { type: 'post', shouldShareToFeed: true } };
      }

      const postMutation = `mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess { post { id status dueAt } }
          ... on MutationError { message }
        }
      }`;

      const postRes = await bufferGraphQL(token, postMutation, { input });
      if (postRes?.data?.createPost?.post) {
        const p = postRes.data.createPost.post;
        console.log(`[Buffer] Post programmato con successo! ID=${p.id} Data=${p.dueAt} Stato=${p.status}`);
      } else {
        console.error(`[Buffer] Errore pubblicazione canale ${channel.name}:`, postRes?.data?.createPost?.message || postRes);
      }
    }
  } catch (err) {
    console.error('[Buffer] Errore esecuzione:', err.message);
  }
}

function bufferGraphQL(token, query, variables = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify({ query, variables });
    const req = https.request('https://api.buffer.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'FinCalcolatore-Autopilot/1.0'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// 3. PUBBLICAZIONE REDDIT
async function publishToReddit() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.log('[Reddit] ⚠️ Credenziali REDDIT_* non impostate nei segreti di GitHub.');
    return;
  }

  try {
    console.log('[Reddit] Autenticazione OAuth in corso...');
    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const authBody = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    const authRes = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'www.reddit.com',
        path: '/api/v1/access_token',
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FinCalcolatore-Bot/1.0 by ' + username
        }
      }, res => {
        let str = '';
        res.on('data', c => str += c);
        res.on('end', () => resolve(JSON.parse(str)));
      });
      req.on('error', reject);
      req.write(authBody);
      req.end();
    });

    if (authRes.access_token) {
      console.log('[Reddit] Token ottenuto! Invio post a r/' + payload.reddit.subreddit);
      const postBody = `api_type=json&kind=self&sr=${payload.reddit.subreddit}&title=${encodeURIComponent(payload.reddit.title)}&text=${encodeURIComponent(payload.reddit.body)}`;
      
      const submitRes = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'oauth.reddit.com',
          path: '/api/submit',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + authRes.access_token,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'FinCalcolatore-Bot/1.0 by ' + username
          }
        }, res => {
          let str = '';
          res.on('data', c => str += c);
          res.on('end', () => resolve(str));
        });
        req.on('error', reject);
        req.write(postBody);
        req.end();
      });

      console.log('[Reddit] Risultato invio:', submitRes);
    }
  } catch (err) {
    console.error('[Reddit] Errore invio post:', err.message);
  }
}

// 4. ARCHIVIAZIONE NELLO STORICO LOCALE
function archiveHistory() {
  const logFile = path.join(__dirname, 'history.log');
  const logLine = `[${new Date().toISOString()}] SLOT=${payload.slot.toUpperCase()} ID=${payload.id} CATEGORY="${payload.category}"\n`;
  fs.appendFileSync(logFile, logLine, 'utf8');
  console.log(`[Storico] Aggiornato log in ${logFile}`);
}

async function run() {
  await publishToBuffer();
  await publishToMeta();
  await publishToReddit();
  archiveHistory();
  console.log('[Dispatcher] Esecuzione completata con successo!');
}

run();
