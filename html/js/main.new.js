
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

function PlayerModel(data){
  var self = this
  self.id = data.id
  self.gameId = data.gameId
  self.active = ko.observable(data.active)
  self.name = ko.observable(data.name)
  
  self.stats = new Stats()
}

function GameModel(data){
  var self = this
  
  self.id = data.id
  
  self.playerCount = ko.computed(function () {
    return self.players.length
  }, self)
  self.players = ko.observableArray([])
  self.ownPlayer = ko.observable(false)
}

function Game(){
  
  var self = this
  var ownPlayerName = false
  
  self.currentGame = ko.observable(false)
  self.games = ko.observableArray([])
  
  // Wenn ein neues Spiel erstellt wurde, wird hierüber das
  // Spiel in das games-Array gespeichert.
  socket.on('added game', function (gameData) {
    self.games.push(gameData)
  })
  
  // Wenn ein Spiel gelöscht wird (z.B. weil keine Spieler mehr drin sind),
  // wird das Spiel auch aus dem games-Array entfernt.
  socket.on('removed game', function (gameId) {
    self.games.remove(function (game) { return game.id === gameId })
    var game = self.currentGame()
    if (game && game.id === gameId) self.currentGame(false)
  })
  
  // Zu Anfang werden sämtliche Spieler einmalig geladen.
  socket.once('load games', function (gamelist) {
    self.games.removeAll()
    for (var k in gamelist) {
      if (gamelist.hasOwnProperty(k)) {
        self.games.push(gamelist[k])
      }
    }
  })
  
  socket.on('joined', function (data) {
    var game = self.currentGame(),
        player = new PlayerModel(data)
    
    // Wenn der Spieler selbst neu in einem Spiel einsteigt,
    // wird zuerst das Spiel hinzugefügt.
    if (!game) {
      var games = self.games()
      for (var k in games) {
        if (games.hasOwnProperty(k) && data.gameId === games[k].id) {
          self.currentGame(game = new GameModel(games[k]))
          if (ownPlayerName && player.name === ownPlayerName) game.ownPlayer(player)
          break
        }
      }
    }
    
    // Anschließend wird der Spieler der Spielerliste hinzugefügt
    game.players.push(player)
  })
  
  socket.on('left', function (playerId) {
    var game = self.currentGame()
    if (game) {
      game.players.remove(function (player) { return player.id === playerId })
      if (game.ownPlayer().id === playerId) {
        self.currentGame(false)
        ownPlayerName = false
      }
    }
  })
  
  // Mit newGame werden zwei Funktionen in einer ausgeführt:
  // 1. es wird ein neues Spiel-Objekt auf dem Server angelegt und
  // 2. wird auch der erste Spieler gleich mit eingetragen.
  self.newGame = function (firstPlayer) {
    socket.emit('new game', firstPlayer)
  }
  
  self.join = function (game, playerName) {
    ownPlayerName = playerName
    socket.emit('join', game.id, playerName)
  }
  
  self.leave = function () {
    socket.emit('leave')
  }
  
}



