
function Stats() {
  var self = this
  self.values = []
  self.isset = []
  
  for (var i = 0; i < 13; i++) {
    self.values.push(ko.observable('-'));
    self.isset.push(ko.observable(false))
  }
  
  self.add = function (index, points) {
    if (!self.isset[index]()) {
      self.values[index](points)
      self.isset[index](true)
    }
  }
  
  self.remove = function (index) {
    if (!self.isset[index]()) {
      self.values[index](0)
      self.isset[index](true)
    }
  }
  
  self.subtotalSum = ko.computed(function (){
    for (var i = 0, sum = 0; i < 6; i++) {
      if (self.values[i]() !== '-') {
        sum += self.values[i]() || 0
      }
    }
    return sum;
  }, self);
  
  self.bonus = ko.computed(function (){
    if (self.subtotalSum() >= 63) return 35;
    return 0;
  }, self);
  
  self.upperSubtotalSum = ko.computed(function (){
    return self.subtotalSum() + self.bonus();
  }, self);
  
  self.lowerSubtotalSum = ko.computed(function (){
    for (var i = 6, sum = 0; i < 13; i++) {
      if (self.values[i]() !== '-') {
        sum += self.values[i]() || 0
      }
    }
    return sum;
  }, self);
  
  self.totalSum = ko.computed(function (){
    return self.lowerSubtotalSum() + self.upperSubtotalSum();
  }, self);

}

function PlayerModel(name, game) {
  var self = this
  self.name = ko.observable(name)
  
  // Statistik-Objekt zur Berechnung der endgültigen Punkte
  self.stats = new Stats()
  
  // Gibt an, ob der aktuelle Spieler am Zug ist
  self.active = ko.observable(false)
  
  // Referenz auf das Game-Objekt
  self.game = game
  
  // Die Werte sämtlicher Würfel
  self.dices = ko.observableArray([])
  
  // Gibt an, ob bereits gewürfelt wurde
  self.hasThrown = ko.observable(false)
  
  // Signalisiert, dass alle Züge gemacht wurden
  self.allDone = ko.observable(false)
  
  // Prüft, ob Punkte hinzugefügt werden können
  self.canAddPoints = function (index, indexBeginsAt) {
    var canAdd = false
    index = index() + (indexBeginsAt || 0)
    
    if (index >= 0 && index <= 5 || index === 12) {
      canAdd = true
    }
    else if (game.countChosenDices() === 5) {
      canAdd = (index === 6 && threeOfAKind(self.dices()))
            || (index === 7 && fourOfAKind(self.dices()))
            || (index === 8 && fullHouse(self.dices()))
            || (index === 9 && isSmallStraight(self.dices()))
            || (index === 10 && isLargeStraight(self.dices()))
            || (index === 11 && yahtzee(self.dices()))
    }
    return canAdd && self.active() && !self.stats.isset[index]() && self.hasThrown()
  }
  
  // Prüft, ob ein Feld gestrichen werden kann
  self.canDisableField = function (index, indexBeginsAt) {
    index = index() + (indexBeginsAt || 0)
    return self.active() && !self.stats.isset[index]() && game.countThrowedDices() === 3
  }
  
  // Gibt die aktuelle Anzahl an Punkten für das betreffende Feld zurück
  self.getPoints = function (index, indexBeginsAt) { 
    index = index() + (indexBeginsAt || 0)
    return self.stats.values[index]()
  }
  
  // Fügt Punkte einem Feld hinzu
  self.addPoints = function (index, indexBeginsAt) {
    index = index() + (indexBeginsAt || 0)
    if (index >= 0 && index <= 5) {
      self.stats.add(index, getAmountOfArrayNumber(self.dices(), index + 1) * (index + 1))
    }
    else {
      switch (index) {
        case 6:
          if (threeOfAKind(self.dices())) self.stats.add(index, sum(self.dices()))
          break
        case 7:
          if (fourOfAKind(self.dices())) self.stats.add(index, sum(self.dices()))
          break
        case 8:
          if (fullHouse(self.dices())) self.stats.add(index, 25)
          break
        case 9:
          if (isSmallStraight(self.dices())) self.stats.add(index, 30)
          break
        case 10:
          if (isLargeStraight(self.dices())) self.stats.add(index, 40)
          break
        case 11:
          if (yahtzee(self.dices())) self.stats.add(index, 50)
          break
        case 12:
          self.stats.add(index, sum(self.dices()))
      }
    }
    
    self.setDone()
    game.nextPlayer()
  }
  
  // Streicht ein Feld
  self.removePoints = function (index, indexBeginsAt) {
    self.stats.remove(index() + (indexBeginsAt || 0))
    self.setDone()
    game.nextPlayer()
  }
  
  self.setDone = function () {
    if (!self.allDone()) {
      var isDone = true
      for (var i = 0; i < self.stats.isset.length; i++){
        if (self.stats.isset[i]() === false) {
          isDone = false
          break
        }
      }
      self.allDone(isDone)
    }
  }
  
  // Überwacht die Anzahl der Würfe, die jeder Spieler machen kann.
  game.countThrowedDices.subscribe(function (count) {
    if (count === 0) {
      self.hasThrown(false)
      return
    }
    self.hasThrown(true)
    self.dices.removeAll()
    
    for (var i = 0; i < game.dices.length; i++) {
      self.dices.push(game.dices[i].value())
    }
    console.log("es wurde mit " + game.countChosenDices() + " Würfeln gewürfelt.")
  })
  
  // Überwacht den Aktivitätsstatus des Spielers
  self.active.subscribe(function (val) {
    if (val) {
      console.log('Der Spieler ' + self.name() + ' ist dran.')
    } else {
      console.log('Der aktive Spieler wird gewechselt.')
    }
  })
  
  // Wählt einen Spieler aus, der entfernt werden soll (nur vor Beginn eines Spiels möglich)
  self.selectRemovablePlayer = function () {
    game.removablePlayer(self.name)
    $('#remove-player-modal').modal('show')
  }
  
}

function GameModel() {
  var self = this
  
  // oben
  self.upperValues = ko.observableArray([
    { name: 'Einser' },
    { name: 'Zweier' },
    { name: 'Dreier' },
    { name: 'Vierer' },
    { name: 'Fünfer' },
    { name: 'Sechser' }
  ])
  
  // unten
  self.lowerValues = ko.observableArray([
    { name: 'Dreierpasch' },
    { name: 'Viererpasch' },
    { name: 'Full House' },
    { name: 'Kleine Straße' },
    { name: 'Große Straße' },
    { name: 'Kniffel' },
    { name: 'Chance' }
  ])
  
  // Spielername, der hinzugefügt werden soll
  self.playerToAdd = ko.observable('')
  
  // Array aller Spieler-Objekte
  self.players = ko.observableArray([])
  
  // Der Spieler, der entfernt werden soll
  self.removablePlayer = ko.observable(false)
  
  // Deselektieren des zu entfernenden Spielers (wenn im Overlay
  // auf einen Schließen-Button geklickt wird)
  self.unselectRemovablePlayer = function () {
    self.removablePlayer(false)
  }
  
  // Erzeugt anhand des eingetragenen Spielernamens ein neues
  // Spieler-Objekt
  self.addPlayer = function () {
    var playerToAdd = self.playerToAdd()
    console.log('spieler ' + playerToAdd + ' wird hinzugefügt')
    // Prevent blanks and duplicates
    if ((playerToAdd != "") && (self.players.indexOf(playerToAdd) < 0)) {
      self.players.push(new PlayerModel(playerToAdd, self))
    }
    self.playerToAdd("") // Clear the text box
  }

  // Entfernt anhand der removablePlayer Variable den betreffenden Spieler
  // aus dem Array
  self.removePlayer = function () {
    if (self.removablePlayer) {
      self.players.remove(function (item) { return self.removablePlayer() === item.name })
      self.unselectRemovablePlayer()
    }
  }
  
  // Signalisiert, wenn ein Spiel angefangen hat
  self.started = ko.observable(false)
  
  // Referenz auf den Spieler, der aktuell dran ist
  self.activePlayer = ko.observable(false)
  
  // Gibt die tatsächliche Anzahl an Würfen an
  self.countThrowedDices = ko.observable(0)
  
  // Gibt die Anzahl der Würfel an, mit denen gewürfelt wurde
  self.countChosenDices = ko.observable(0)
  
  self.winner = ko.observable(false)
  self.countPlayersDone = ko.observable(0)
  self.allDone = ko.observable(false)
  
  // Startet das erzeugte Spiel
  self.startGame = function () {
    if (self.players().length > 0) {
      self.started(true)
      self.nextPlayer()
    }
  }
  
  var currentPlayer = -1
  
  // Wechselt zum nächsten Spieler. Wenn der letzte Spieler
  // überschritten ist, wird wieder bei Spieler 1 begonnen.
  self.nextPlayer = function () {
    if (self.activePlayer()) self.activePlayer().active(false)
    
    currentPlayer++
    if (currentPlayer > self.players().length - 1) currentPlayer = 0
    
    // Wenn der aktive Spieler und der Folgespieler auf DONE sind, kann
    // davon ausgegangen werden, dass alle Spieler ihren letzten Zug
    // gemacht haben.
    // Das heißt, wir küren einen Gewinner!
    if (self.activePlayer() && self.activePlayer().allDone() && self.players()[currentPlayer].allDone()) {
      var winner = false
      for (var i = 0; i < self.players().length; i++) {
        var player = self.players()[i]
        if (!winner || (winner.stats.totalSum() < player.stats.totalSum())) {
          winner = player
        }
      }
      self.winner(winner)
    }
    
    // Ansonsten geht das Spiel wohl noch weiter ;-)
    else {
      self.players()[currentPlayer].active(true)
      self.activePlayer(self.players()[currentPlayer])
      
      // Zurücksetzen der Werte
      self.countThrowedDices(0)
      self.countChosenDices(5)
      
      // initialer Wurf ist mit allen Würfeln - und um den Spieler
      // nicht zu verwirren, werden die Würfel am Anfang ausgeblendet
      $('#dices').hide()
      for (var i = 0; i < self.dices.length; i++) {
        self.dices[i].chosen(true)
      }
    }
  }
  
  self.startNewGame = function () {
    currentPlayer = -1
    self.winner(false)
    self.started(false)
    self.activePlayer(false)
    self.players.removeAll()
  }
  
  // Damit auch die richtigen Augen angezeigt werden,
  // muss die Grafik auf den richtigen Index gemappt
  // werden. :-)
  self.diceIndices = [5,4,8,2,6,9]
  
  // Array mit den Würfeln, der Werte und dem DOM-Objekt
  self.dices = []
  
  // Befehl zum Würfeln
  self.dicing = function () {
    if (self.countThrowedDices() === 3) {
      return
    }
    var countChosenDices = 0
    var countThrowedDices = self.countThrowedDices()
    
    if (countThrowedDices === 0) $('#dices').show()
    
    for (var i = 0; i < self.dices.length; i++) {
      var dice = self.dices[i]
      if (dice.chosen()) {
        console.log("würfel mit " + i + "...")
        console.info(dice.frame.closest('li')[0].id)
        dice.value(_.random(1, 6))
        countChosenDices++
      }
    }
    self.countChosenDices(countChosenDices)
    if (self.countChosenDices() > 0) {
      self.countThrowedDices(countThrowedDices + 1)
    } else {
      $('#no-dices-modal').modal('show')
    }
    self.unselectAllDices()
  }
  
  self.selectAllDices = function () {
    $('#dices>li').addClass('ui-selected')
    for (var i = 0; i < self.dices.length; i++) {
      self.dices[i].chosen(true)
    }
  }
  
  self.unselectAllDices = function () {
    $('#dices>li').removeClass('ui-selected')
    for (var i = 0; i < self.dices.length; i++) {
      self.dices[i].chosen(false)
    }
  }
  
}

// Größe der anzuzeigenden Würfel
var diceWidth = Math.round(512 * 0.28),
    diceHeight = Math.round(512 * 0.30)

// Würfel sollen auswählbar sein
$("#dices").selectable({
  autoRefresh: false,
  tolerance: "fit"
})
// Wenn eine Auswahl getroffen wurde, wird der Würfel markiert
.on('selectableselected', function (event, ui) {
  var selected = $(ui.selected), index = selected.index()
  
  console.log('selected', game.dices[index].frame.closest('li')[0].id, index)
  
  game.dices[index].chosen(true)
})
// Wenn die Auswahl entfernt wurde, wird die Markierung entfernt
.on('selectableunselected', function (event, ui) {
  var unselected = $(ui.unselected), index = unselected.index()
  game.dices[index].chosen(false)
})

function loadIndexHandler (i, n) {
  return function(){
    
    // Wenn das Bild geladen ist, wird es in das Container-Div verschoben.
    var frame = $(this).appendTo(n)
      .width(diceWidth)
      .height(diceHeight)
    
    // Das Bild wird in Frames aufgesplittet
    frame.clip({
      width: diceWidth,
      height: diceHeight,
      frameWidth: Math.floor(diceWidth / 3),
      frameHeight: Math.floor(diceHeight / 3)
    })
    
    // Die Würfel werden als Objekt an das dices-Array übergeben
    var dice = {
      chosen: ko.observable(true),
      value: ko.observable(),
      frame: frame,
      index: i
    }
    dice.value.subscribe(function (val) {
      console.log('my index is #', dice.index, ' for ', dice.frame.closest('li')[0].id)
      if (dice.chosen()) {
        dice.frame.clip('frame', game.diceIndices[val - 1])
      }
    })
    game.dices.unshift(dice)
  }
}

// Die Vorbereitung der Würfel muss nur ein einziges Mal durchgeführt werden.
$('#dices>li').each(function (i, n) {
  $.Image('img/dice_texture.png', loadIndexHandler(i, n))
})

// Das Modell wird nun an knockout übergeben
// und sämtliche Observables definiert...
var game = new GameModel()
ko.applyBindings(game)


