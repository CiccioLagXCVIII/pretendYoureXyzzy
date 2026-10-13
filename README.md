# 🃏 Pretend You're Xyzzy — Modern & Mobile Edition

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![License: BSD & CC BY-NC-SA](https://img.shields.io/badge/License-BSD%20%26%20CC--BY--NC--SA-blue.svg)](license.html)
[![Language: Italian](https://img.shields.io/badge/Language-Italian-green.svg)](#localizzazione)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-orange.svg)](#-ottimizzazione-mobile-e-smartphone)

**Pretend You're Xyzzy (Modern & Mobile Edition)** è una versione rinnovata, reattiva e modernizzata del celebre clone open-source per il web di **[Cards Against Humanity](https://cardsagainsthumanity.com/)** (originariamente creato da [Andy Janata](https://github.com/ajanata/PretendYoureXyzzy)).

Questo repository trasforma il frontend storico del gioco in una **web app moderna, fluida e mobile-first**, completamente **tradotta in italiano**, arricchita con componenti grafici in stile **Material Design**, supporto dedicato ai mazzi personalizzati **Cardcast** e già configurata per il deploy serverless istantaneo su **Vercel** tramite proxy verso un backend di gioco attivo.

---

## 🌟 Caratteristiche Principali

### 📱 Ottimizzazione Mobile & Smartphone (`smartphone.css` & `custom.js`)
L'interfaccia originale su schermi touch e smartphone risultava complessa da navigare. Questa versione introduce:
- **Switcher Intelligente Mano / Tavolo (`🃏 La Tua Mano` ↔ `🏛️ Tavolo`)**:
  - Barra di commutazione rapida visibile esclusivamente su smartphone (≤ 768px).
  - **Auto-rilevamento automatico del ruolo**: passa automaticamente alla visualizzazione del Tavolo quando sei il *Card Czar* o durante la fase di giudizio, e torna alla Tua Mano durante il turno di selezione.
  - Possibilità di cambiare liberamente e istantaneamente vista in qualunque momento.
- **Chat Mobile Collassabile con Barra Toggle (`#chat_toggle_bar`)**:
  - Di default in partita, la chat si comprime a fondo schermo lasciando pieno spazio al tavolo da gioco e alla classifica.
  - Toccando la barra superiore della chat ("💬 Chat Mostra ▲"), il box si espande con scorrimento automatico (*autoscroll*) all'ultimo messaggio ricevuto.
- **Layout Flessibile a Schermo Intero**: utilizzo di unità viewport moderne (`100dvh`) per evitare problemi di scrolling anomalo su Safari iOS e Chrome Android.

### 🎨 UI Moderna e Material Design (`cah.css`)
- **Riprogettazione completa con CSS Flexbox e Grid**: sostituzione del vecchio layout a posizionamento fisso con una struttura modulare adattabile a qualsiasi risoluzione.
- **Componenti Material Design**: toggle switch animati, badge di stato, tabelle con ombre morbide, modali pulite ed elementi con bordi arrotondati.
- **Pannello Opzioni Partita Avanzato**:
  - Visualizzazione e mascheramento rapido della password della stanza con icona show/hide a forma di occhio (SVG).
  - Selettori chiari per punti vittoria, limite partecipanti, spettatori e moltiplicatore del timer.
  - Sezioni collassabili per categorie di mazzo.

### 🃏 Gestione Mazzi Personalizzati Cardcast (`cast.clrtd.com`)
- **Sezione dedicata nella lobby pre-partita**: inserisci semplicemente il codice mazzo a 5 caratteri (es. `ABCDE`).
- **Comando automatico integrato**: invia in background il comando `/addcardcast <codice>` alla chat di partita senza bisogno di digitare comandi manuali.
- **Rilevamento in tempo reale**: monitora i log di sistema e mostra la lista visiva dei mazzi aggiunti con il conteggio dettagliato di carte bianche e carte nere.

### 🇮🇹 Interfaccia Completamente in Italiano
- Schermata di login, lobby di attesa, opzioni di gioco, descrizioni, pulsanti di azione, messaggi di stato e filtri mazzi completamente tradotti in lingua italiana.

### ⚡ Pronto per il Deploy su Vercel (`vercel.json`)
- Il client statico include un file di configurazione con regole di rewrite/reverse-proxy verso il backend servlet di Pretend You're Xyzzy (`https://xyzzy.clrtd.com/zy/`).
- Risolve nativamente le problematiche di CORS per le richieste AJAX e le connessioni Long-Polling.

---

## 🏗️ Architettura del Progetto

```
[ Browser Desktop / Smartphone ]
               │
               ▼  (HTML5 / Modern CSS / jQuery)
    ┌──────────────────────────┐
    │    Vercel Edge Proxy     │
    │      (vercel.json)       │
    └──────────┬───────────────┘
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
[ Static Assets ]                 [ Backend Remoto PYX ]
- index.html                      - /zy/AjaxServlet      (Azioni, Carte, Gioco)
- cah.css & smartphone.css        - /zy/LongPollServlet  (Eventi live e Chat)
- custom.js & js/cah.*.js         - https://xyzzy.clrtd.com
```

---

## 📁 Struttura dei File

| File / Cartella | Descrizione |
|---|---|
| [`index.html`](file:///index.html) | Entry point dell'applicazione con template delle carte, canvas principale, modali e traduzioni. |
| [`cah.css`](file:///cah.css) | Foglio di stile principale completamente riscritto con Flexbox, CSS Grid e stile Material. |
| [`smartphone.css`](file:///smartphone.css) | Regole CSS dedicate per dispositivi mobili (schermi ≤ 768px). |
| [`custom.js`](file:///custom.js) / [`js/custom.js`](file:///js/custom.js) | Script personalizzato per lo switcher mobile Mano/Tavolo, toggle chat, integrazione Cardcast e header stanza. |
| [`vercel.json`](file:///vercel.json) | Configurazione delle rotte di proxy (`rewrites`) verso il server servlet di gioco. |
| `js/` | Core JavaScript del client di gioco: |
| ├─ `cah.app.js` | Inizializzazione applicazione e ciclo di vita. |
| ├─ `cah.game.js` | Logica del tavolo di gioco, gestione round, ruoli e interazioni. |
| ├─ `cah.ajax.js` & `cah.ajax.handlers.js` | Dispatcher e gestori delle chiamate AJAX verso il backend. |
| ├─ `cah.longpoll.js` | Connessione in tempo reale per la ricezione degli eventi di gioco via Long Polling. |
| ├─ `cah.card.js` & `cah.cardset.js` | Rendering e interazione con le carte bianche e nere. |
| └─ `cah.preferences.js` | Gestione preferenze utente (filtro utenti, notifiche, carte già viste). |
| `images/` | Sprite e icone per componenti UI. |
| [`license.html`](file:///license.html) | Dettaglio licenze software e contenuti grafici. |
| [`changelog.html`](file:///changelog.html) | Storico delle versioni e aggiornamenti. |

---

## 🚀 Guida all'Installazione e Avvio

### 1. Esecuzione in Locale

Poiché il progetto necessita del proxy verso il backend per le API `/AjaxServlet` e `/LongPollServlet`, il modo più immediato per eseguirlo in locale è tramite **Vercel CLI**:

```bash
# Installa la CLI di Vercel se non già presente
npm i -g vercel

# Clona la repository ed entra nella cartella
git clone https://github.com/CiccioLagXCVIII/pretendYoureXyzzy.git
cd pretendYoureXyzzy

# Avvia l'ambiente di sviluppo con il supporto proxy di vercel.json
vercel dev
```

In alternativa, puoi utilizzare un qualsiasi server HTTP statico (es. con estensione *Live Server* di VS Code, oppure `npx serve .` o `python -m http.server 3000`), a condizione che le richieste alle servlet vengano indirizzate all'endpoint corretto configurato nel file [`vercel.json`](file:///vercel.json).

### 2. Deploy su Vercel

Il progetto è preconfigurato per essere distribuito direttamente su [Vercel](https://vercel.com):

1. Fai il push del repository sul tuo account GitHub.
2. Vai sulla dashboard di Vercel e clicca su **Add New Project**.
3. Seleziona il repository `pretendYoureXyzzy`.
4. Lascia i parametri di build predefiniti (progetto statico, nessun comando di build necessario).
5. Clicca su **Deploy**.

Le regole in [`vercel.json`](file:///vercel.json) si occuperanno automaticamente di instradare le chiamate servlet verso `https://xyzzy.clrtd.com/zy/`.

---

## ⚙️ Configurazione del Backend

Se desideri collegare il client a un backend self-hosted diverso (ad esempio una propria istanza Java di Pretend You're Xyzzy in esecuzione locale o su un server VPS dedicato), modifica le destinazioni in [`vercel.json`](file:///vercel.json):

```json
{
  "rewrites": [
    {
      "source": "/AjaxServlet",
      "destination": "https://TUO-SERVER-BACKEND/zy/AjaxServlet"
    },
    {
      "source": "/LongPollServlet",
      "destination": "https://TUO-SERVER-BACKEND/zy/LongPollServlet"
    },
    {
      "source": "/zy/(.*)",
      "destination": "https://TUO-SERVER-BACKEND/zy/$1"
    }
  ]
}
```

---

## 🎮 Come Giocare

1. **Accesso**:
   - Inserisci un **Nickname** nella schermata principale.
   - *(Opzionale)* Inserisci un codice di identificazione segreto per proteggere il tuo nome da impersonificazioni.
   - Clicca su **Entra**.
2. **Lobby & Partite**:
   - Visualizza l'elenco delle partite disponibili con il numero di partecipanti e lo stato.
   - Clicca su **Entra** in una partita esistente, oppure seleziona **Crea Partita** nella barra dei comandi in alto.
3. **Configurazione Stanza (per l'Host)**:
   - Scegli il punteggio di vittoria, i limiti giocatori/spettatori e la velocità del timer.
   - Aggiungi i mazzi base o inserisci i codici di mazzi personalizzati da **[cast.clrtd.com](https://cast.clrtd.com)** nel riquadro apposito.
   - Clicca su **Avvia Partita**.
4. **Durante la Partita**:
   - **Giocatore**: Seleziona una o più carte bianche dalla tua mano per completare la frase della carta nera e premi **Conferma Selezione**.
   - **Card Czar**: Attendi che tutti i giocatori abbiano risposto, leggi le combinazioni sul tavolo e clicca sulla carta che ritieni più divertente per assegnare il punto!
   - **Da Smartphone**: Usa i pulsanti `🃏 La Tua Mano` e `🏛️ Tavolo` o lascia fare all'auto-switch del gioco. Espandi la chat con un tap su `💬 Chat Mostra ▲` per parlare con gli altri giocatori.

---

## ⚖️ Licenze e Crediti

- **Pretend You're Xyzzy**: Copyright &copy; 2012–2018 Andy Janata ([ajanata/PretendYoureXyzzy](https://github.com/ajanata/PretendYoureXyzzy)), distribuito con licenza **BSD a 2 clausole**.
- **Cards Against Humanity**: Il gioco originale *Cards Against Humanity* è distribuito sotto licenza **[Creative Commons BY-NC-SA 3.0](http://creativecommons.org/licenses/by-nc-sa/3.0/)**. Questa versione web non è sponsorizzata né affiliata a Cards Against Humanity LLC.
- **Modern Mobile Redesign & Adattamento**: Sviluppato da [CiccioLagXCVIII (Francesco Lo Verde)](https://github.com/CiccioLagXCVIII).
- Per consultare l'elenco completo delle licenze e delle librerie di terze parti (jQuery, jQuery UI, QTransform, tablesorter), consulta il file [`license.html`](file:///license.html).