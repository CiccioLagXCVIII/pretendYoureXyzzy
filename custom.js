/**
 * Pretend You're Xyzzy - Custom Enhancement & Mobile Script (js/custom.js)
 * 
 * 1. Gestione Mazzi Personalizzati Cardcast (/addcardcast, monitor log chat, lista mazzi).
 * 2. Header dinamico Stanza di Gioco ("Stanza di Host (#X)").
 * 3. Switch Chat Globale e Chat Partita senza conflitti né forzature periodiche:
 *    - Quando si entra in partita, la chat della partita viene selezionata 1 sola volta.
 *    - L'utente può passare liberamente da Chat Globale a Chat Partita senza reload o rimbalzi.
 * 4. Toggle touch collasso/espansione chat su Smartphone (<= 768px):
 *    - Default in partita: chat collassata a 80px (scoreboard visibile).
 *    - Al tap su "#chat_toggle_bar", espande a 270px con autoscroll del log.
 * 5. Accordion/Toggle per mazzi Cardcast e Standard su mobile.
 */

$(document).ready(function() {
  "use strict";

  window.loadedCardcastDecks = window.loadedCardcastDecks || [];

  // ==========================================
  // 1. GESTIONE MAZZI PERSONALIZZATI CARDCAST
  // ==========================================

  $(document).on("click", "#custom_cardcast_btn, .custom_cardcast_btn", function() {
    submitCustomDeck();
  });

  $(document).on("keypress", "#custom_cardcast_code, .custom_cardcast_code", function(e) {
    if (e.which === 13) {
      submitCustomDeck();
    }
  });

  function submitCustomDeck() {
    var $input = $("#custom_cardcast_code:visible, .custom_cardcast_code:visible").last();
    if (!$input.length) $input = $("#custom_cardcast_code");
    
    var code = $.trim($input.val().toUpperCase());
    var $status = $(".custom_cardcast_status, #custom_cardcast_status");

    if (!code) {
      $status.css("color", "#d32f2f").text("Inserisci un codice valido!");
      return;
    }

    var $gameChatInput = $(".game .chat, [id*='tab-chat-game'] .chat, [id^='tab-game-'] .chat, .tab-game .chat");
    var $gameChatBtn = $(".game .chat_submit, [id*='tab-chat-game'] .chat_submit, [id^='tab-game-'] .chat_submit, .tab-game .chat_submit");

    if (!$gameChatInput.length) {
      $gameChatInput = $("input.chat:visible");
      $gameChatBtn = $("input.chat_submit:visible");
    }

    if ($gameChatInput.length) {
      $status.css("color", "#1976D2").text("Aggiunta del mazzo " + code + " in corso...");
      $gameChatInput.val("/addcardcast " + code);
      $gameChatBtn.click();
      $input.val("");
    } else {
      $status.css("color", "#d32f2f").text("Errore: chat della partita non trovata.");
    }
  }

  // Monitora il log della chat per i mazzi aggiunti
  setInterval(function() {
    $(".log").each(function() {
      var logText = $(this).text();
      var regex = /Added:\s*Cardcast\s*deck\s*['"‘](.+?)['"’]\s*\(code:\s*([A-Za-z0-9]+)\),\s*with\s*(\d+)\s*black cards\s*and\s*(\d+)\s*white cards/gi;
      var match;

      while ((match = regex.exec(logText)) !== null) {
        var deckName = match[1];
        var deckCode = match[2].toUpperCase();
        var blackCards = match[3];
        var whiteCards = match[4];

        addDeckToUiList(deckName, deckCode, blackCards, whiteCards);
      }
    });
  }, 600);

  function addDeckToUiList(name, code, blackCount, whiteCount) {
    if (window.loadedCardcastDecks.indexOf(code) !== -1) {
      return;
    }
    window.loadedCardcastDecks.push(code);

    var $container = $(".custom_cardcast_list_container, #custom_cardcast_list_container");
    var $list = $(".custom_cardcast_list, #custom_cardcast_list");
    var $status = $(".custom_cardcast_status, #custom_cardcast_status");

    $container.show();
    var $li = $("<li>")
      .attr("data-code", code)
      .css({"margin-bottom": "4px"})
      .html("<strong>" + name + "</strong> (<code style='background:#e3f2fd; padding:1px 4px; border-radius:3px;'>" + code + "</code>) — <span style='color:#555;'>" + blackCount + " nere, " + whiteCount + " bianche</span>");
    
    $list.append($li);
    $status.css("color", "#2e7d32").text("Mazzo '" + name + "' aggiunto con successo!");
  }


  // =========================================================================
  // 2. TOGGLE SWITCH MAZZI CARDCAST E STANDARD SU MOBILE
  // =========================================================================

  $(document).on("change", "#cardcast_toggle_cb", function () {
    var isChecked = $(this).is(":checked");
    $(".cardcast_custom_sets").toggle(isChecked);
  });

  $(document).on("change", "#standard_decks_toggle_cb", function () {
    var isChecked = $(this).is(":checked");
    $(".card_sets, .standard_card_sets").toggle(isChecked);
  });


  // =========================================================================
  // 3. COLLASSO / ESPANSIONE CHAT SU MOBILE (<= 768px)
  // =========================================================================

  function isMobile() {
    return window.innerWidth <= 768;
  }

  $(document).on("click", "#chat_toggle_bar", function (e) {
    if (!isMobile()) return;
    e.preventDefault();

    var $bottom = $("#bottom");
    var $body = $("body");
    var isExpanded = $bottom.hasClass("mobile_chat_expanded") || $body.hasClass("mobile-chat-open");

    if (isExpanded) {
      $bottom.removeClass("mobile_chat_expanded");
      $body.removeClass("mobile-chat-open");
      $(".chat_toggle_status").text("Mostra ▲");
    } else {
      $bottom.addClass("mobile_chat_expanded");
      $body.addClass("mobile-chat-open");
      $(".chat_toggle_status").text("Nascondi ▼");

      // Autoscroll del log visibile
      setTimeout(function () {
        var $visibleLog = $("#tabs > div:visible .log");
        if ($visibleLog.length) {
          $visibleLog.scrollTop($visibleLog.prop("scrollHeight"));
        }
      }, 100);
    }
  });

  // Autoscroll quando si clicca su una tab
  $(document).on("click", "#tabs ul li a", function () {
    setTimeout(function () {
      var $visibleLog = $("#tabs > div:visible .log");
      if ($visibleLog.length) {
        $visibleLog.scrollTop($visibleLog.prop("scrollHeight"));
      }
    }, 80);
  });


  // =========================================================================
  // 4. STATO PARTITA, TITOLO STANZA & TRANSIZIONE TAB
  // =========================================================================

  var wasInGame = false;
  var lastGameId = null;

  function updateRoomHeaderAndTabs() {
    var hasGameElement = $("#main_holder .game:visible").length > 0;
    var hasGameHash = window.location.hash.indexOf("game=") !== -1;
    var isInsideGame = hasGameElement || hasGameHash;

    if (!isInsideGame) {
      // SIAMO IN LOBBY
      if (wasInGame) {
        wasInGame = false;
        lastGameId = null;
        $("body").addClass("in-lobby").removeClass("in-game mobile-chat-open");
        $("#bottom").removeClass("mobile_chat_expanded");
        $(".chat_toggle_status").text("Mostra ▲");

        // Attiva chat globale quando si torna nella lobby
        $("#button-global").trigger("click");

        // Svuota lista mazzi se si esce dalla partita
        if (window.loadedCardcastDecks.length > 0) {
          window.loadedCardcastDecks = [];
          $(".custom_cardcast_list").empty();
          $(".custom_cardcast_list_container").hide();
        }
      } else {
        $("body").addClass("in-lobby").removeClass("in-game");
      }
      return;
    }

    // SIAMO IN PARTITA
    $("body").addClass("in-game").removeClass("in-lobby");

    // Estrai ID partita
    var match = window.location.hash.match(/game=(\d+)/);
    var currentGameId = match ? match[1] : "active";

    // Se siamo appena entrati in partita per la prima volta:
    if (!wasInGame || lastGameId !== currentGameId) {
      wasInGame = true;
      lastGameId = currentGameId;

      // Su smartphone: imposta la chat collassata di default all'ingresso
      if (isMobile()) {
        $("#bottom").removeClass("mobile_chat_expanded");
        $("body").removeClass("mobile-chat-open");
        $(".chat_toggle_status").text("Mostra ▲");
      }

      // Seleziona la tab della chat di partita SOLO ALL'INGRESSO (1 sola volta!)
      setTimeout(function() {
        var $gameTabLink = $('#tabs ul li a[href*="tab-chat-game"], #tabs ul li a[href^="#tab-game-"]');
        if ($gameTabLink.length) {
          $gameTabLink.trigger("click");
        }
      }, 50);
    }

    // Determina l'Host della partita
    var hostName = "";
    $(".scorecard").each(function() {
      var status = $(this).find(".scorecard_status").text().trim().toLowerCase();
      if (status.indexOf("host") !== -1) {
        hostName = $(this).find(".scorecard_player").text().trim();
        return false;
      }
    });

    if (!hostName) {
      if (window.cah && cah.nickname) {
        hostName = cah.nickname;
      } else {
        hostName = $.trim($("#nickname").val());
      }
    }

    var gameNum = match ? match[1] : "";
    var titleText = "Stanza di Gioco";
    if (hostName && gameNum) {
      titleText = "Stanza di " + hostName + " (#" + gameNum + ")";
    } else if (hostName) {
      titleText = "Stanza di " + hostName;
    } else if (gameNum) {
      titleText = "Partita #" + gameNum;
    }

    var $roomNameEl = $(".game_room_name");
    if ($roomNameEl.length && $roomNameEl.text() !== titleText) {
      $roomNameEl.text(titleText);
    }
  }

  // Esegui il controllo stato a intervallo senza disturbare le tab attive dell'utente
  setInterval(updateRoomHeaderAndTabs, 500);
  window.addEventListener("hashchange", updateRoomHeaderAndTabs);
});