

Events, die an den Server gehen
===============================

* Spieler erstellen
  socket.emit('add player', name, password)
  socket.on('added player', function (uuid) { ... })

* Spieler löschen
  socket.emit('remove player')
  socket.on('removed player', function (uuid) { ... })

* Spiel erstellen
  socket.emit('new game', playerName) // Startender Spieler
  
    * Als Spieler beitreten
      socket.emit('join', game, playerName) // beliebiger Spieler
      socket.on('joined', function (playerName) { ... }) // feedback an alle Spieler
      
      socket.emit('leave') // beliebiger Spieler
      socket.on('left', function (playerName) { ... }) // feedback an alle Spieler
      
    * Spiel starten (max 6 Spieler)
      socket.emit('start game') // Startender Spieler
      
      * Spielzug durchführen
        socket.emit('throw dices') // aktiver Spieler
        
          * Ergebnis eintragen oder Eintrag streichen
            socket.emit('save entry') // aktiver Spieler
          
          * Nächster Spieler
            socket.emit('next player') // aktiver Spieler


Events, die vom Server kommen
=============================

* Liste der Spiele (wenn man noch keinem beigetreten ist)
  socket.on('list games', function (games) { ... })

* Zug eines Spielers beendet
  socket.on('turn done', function (playerName, data) { ... })

* Spiel beendet
  socket.on('game ended', function (winnerName) { ... })




