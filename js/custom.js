$(document).ready(function() {
  window.loadedCardcastDecks = window.loadedCardcastDecks || [];

  // ==========================================
  // 1. GESTIONE MAZZI PERSONALIZZATI CARDCAST
  // ==========================================

  // Click su "Aggiungi Mazzo"
  $(document).on("click", "#custom_cardcast_btn, .custom_cardcast_btn", function() {
    submitCustomDeck();
  });

  // Invio con tasto Enter sull'input del mazzo
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
      
      // Invia comando chat al server
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
  // 2. NOME STANZA DINAMICO ("Stanza di Host (#X)") & SELEZIONE CHAT STANZA
  // =========================================================================

  function updateRoomHeaderAndTabs() {
    // Determina in modo inequivocabile se siamo dentro una partita
    var hasGameElement = $("#main_holder .game:visible").length > 0;
    var hasGameHash = window.location.hash.indexOf("game=") !== -1;
    var isInsideGame = hasGameElement || hasGameHash;

    if (!isInsideGame) {
      // SIAMO IN LOBBY
      $("body").addClass("in-lobby").removeClass("in-game");

      // Se le tab Preferenze/Filtri erano nascoste, ora sono libere
      // Se non c'è una tab selezionata, seleziona Chat Globale
      var $activeTab = $("#tabs ul li.ui-tabs-active");
      if (!$activeTab.length) {
        $("#button-global").trigger("click");
      }

      // Svuota la memoria mazzi se siamo appena usciti
      if (window.loadedCardcastDecks.length > 0) {
        window.loadedCardcastDecks = [];
        $(".custom_cardcast_list").empty();
        $(".custom_cardcast_list_container").hide();
      }
      return;
    }

    // SIAMO IN PARTITA
    $("body").addClass("in-game").removeClass("in-lobby");

    // 1. Trova e seleziona in automatico la tab della partita
    var $gameTabLink = $('#tabs ul li a[href*="tab-chat-game"], #tabs ul li a[href^="#tab-game-"]');
    if ($gameTabLink.length) {
      var $li = $gameTabLink.closest("li");
      if (!$li.hasClass("ui-tabs-active")) {
        $gameTabLink.trigger("click");
      }
    }

    // 2. Determina l'Host della partita
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

    // 3. Estrai numero partita dall'hash (#game=3)
    var match = window.location.hash.match(/game=(\d+)/);
    var gameNum = match ? match[1] : "";

    // 4. Costruisci il titolo
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

  // Esegui il controllo continuo su DOM e hash URL
  setInterval(updateRoomHeaderAndTabs, 400);
  window.addEventListener("hashchange", updateRoomHeaderAndTabs);
});