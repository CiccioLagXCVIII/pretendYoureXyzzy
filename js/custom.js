$(document).ready(function() {
  // Gestione click sul pulsante "Aggiungi Mazzo"
  $(document).on("click", "#custom_cardcast_btn", function() {
    submitCustomDeck();
  });

  // Permette di premere Invio nel campo di testo del codice
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

    // Cerchiamo la chat attiva della partita
    // (nelle partite di PYX, l'input chat della partita ha classe .chat dentro la tab della partita)
    var $gameChatInput = $(".game .chat, [id^='tab-game-'] .chat, .tab-game .chat");
    var $gameChatBtn = $(".game .chat_submit, [id^='tab-game-'] .chat_submit, .tab-game .chat_submit");

    // Se non troviamo il campo specifico della partita, proviamo l'ultimo input chat visibile
    if (!$gameChatInput.length) {
      $gameChatInput = $("input.chat:visible");
      $gameChatBtn = $("input.chat_submit:visible");
    }

    if ($gameChatInput.length) {
      // Inserisce il comando e simula l'invio
      $gameChatInput.val("/addcardcast " + code);
      $gameChatBtn.click();

      $status.css("color", "green").text("Comando inviato per il mazzo: " + code);
      $input.val("");
    } else {
      $status.css("color", "red").text("Errore: impossibile trovare la chat della partita.");
    }
  }
});