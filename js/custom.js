$(document).ready(function() {
  window.loadedCardcastDecks = window.loadedCardcastDecks || [];

  // Click su "Aggiungi Mazzo"
  $(document).on("click", "#custom_cardcast_btn, .custom_cardcast_btn", function() {
    submitCustomDeck();
  });

  // Invio con tasto Enter
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

    var $gameChatInput = $(".game .chat, [id^='tab-game-'] .chat, .tab-game .chat");
    var $gameChatBtn = $(".game .chat_submit, [id^='tab-game-'] .chat_submit, .tab-game .chat_submit");

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

  // Monitora il testo della chat
  setInterval(function() {
    $(".log").each(function() {
      var logText = $(this).text();

      // Cerca il messaggio in chiaro (indipendentemente dai tag HTML interni)
      // Esempio: Added: Cardcast deck 'Meme calta' (code: HVHST), with 2 black cards and 31 white cards.
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
      return; // Evita duplicati
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
});