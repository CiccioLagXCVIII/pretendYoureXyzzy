$(document).ready(function() {
  // Array per memorizzare i mazzi aggiunti in memoria locale
  window.loadedCardcastDecks = window.loadedCardcastDecks || [];

  // Click su "Aggiungi Mazzo"
  $(document).on("click", "#custom_cardcast_btn", function() {
    submitCustomDeck();
  });

  // Invio con tasto Enter
  $(document).on("keypress", "#custom_cardcast_code", function(e) {
    if (e.which === 13) {
      submitCustomDeck();
    }
  });

  function submitCustomDeck() {
    var $input = $("#custom_cardcast_code");
    var code = $.trim($input.val().toUpperCase());
    var $status = $("#custom_cardcast_status");

    if (!code) {
      $status.css("color", "red").text("Inserisci un codice valido!");
      return;
    }

    var $gameChatInput = $(".game .chat, [id^='tab-game-'] .chat, .tab-game .chat");
    var $gameChatBtn = $(".game .chat_submit, [id^='tab-game-'] .chat_submit, .tab-game .chat_submit");

    if (!$gameChatInput.length) {
      $gameChatInput = $("input.chat:visible");
      $gameChatBtn = $("input.chat_submit:visible");
    }

    if ($gameChatInput.length) {
      $status.css("color", "#1976D2").text("Aggiunta del mazzo " + code + " in corso...");
      
      // Invia comando al server
      $gameChatInput.val("/addcardcast " + code);
      $gameChatBtn.click();
      $input.val("");
    } else {
      $status.css("color", "red").text("Errore: chat della partita non trovata.");
    }
  }

  // Monitora i messaggi in chat per intercettare i dettagli del mazzo caricato
  var originalChatHandler = cah.log.info;
  setInterval(function() {
    $(".log").each(function() {
      var logHtml = $(this).html();
      // Cerca il pattern: Added: Cardcast deck 'Nome' (code: CODICE), with X black cards and Y white cards.
      var regex = /Added: Cardcast deck '([^']+)' \(code: ([A-Z0-9]+)\), with (\d+) black cards and (\d+) white cards/g;
      var match;
      while ((match = regex.exec(logHtml)) !== null) {
        var deckName = match[1];
        var deckCode = match[2];
        var blackCards = match[3];
        var whiteCards = match[4];

        addDeckToUiList(deckName, deckCode, blackCards, whiteCards);
      }
    });
  }, 1000);

  function addDeckToUiList(name, code, blackCount, whiteCount) {
    if (window.loadedCardcastDecks.indexOf(code) !== -1) {
      return; // Già mostrato
    }
    window.loadedCardcastDecks.push(code);

    $("#custom_cardcast_list_container").show();
    var $li = $("<li>")
      .attr("data-code", code)
      .html("<strong>" + name + "</strong> (" + code + ") — <span style='color:#666;'>" + blackCount + " nere, " + whiteCount + " bianche</span>");
    
    $("#custom_cardcast_list").append($li);
    $("#custom_cardcast_status").css("color", "green").text("Mazzo '" + name + "' aggiunto con successo!");
  }
});