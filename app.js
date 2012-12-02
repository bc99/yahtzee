
var app     = require('http').createServer(handler)
  , io      = require('socket.io').listen(app)
  , fs      = require('fs')
  , path    = require('path')
  , mime    = require('mime')
  , _       = require('underscore')
  , Yahtzee = require('./lib/yahtzee')

require('./lib/extend-natives')

app.listen(3000);

function createHeader(contentLength, contentType){
  return {
    'content-length': contentLength,
    'content-type': contentType + '; charset=utf-8',
    'connection': 'keep-alive',
    'server': 'nodejs',
    'accept': '*/*'
  }
}

function handler (req, res) {
  if (req.url === '/') req.url = '/index.html'
  var normalizedPath = path.normalize('html/' + req.url)
  
  if (fs.existsSync(normalizedPath)){
    var data = fs.readFileSync(normalizedPath, 'binary')
    res.writeHead(200, createHeader(data.length, mime.lookup(normalizedPath))
    res.end(data)
  } else {
    var documentError404 = "<p>not found!</p>";
    res.writeHead(404, createHeader(documentError404.length, 'text/html'))
    res.end(documentError404)
  }

}

function Game(gameName, client) {
  var obj = {}, players = [], countPlayers = 0
  
  obj.name      = gameName
  obj.starter   = client
  obj.isRunning = false
  
  obj.addPlayer = function (nick) {
    players.push(nick)
    countPlayers = players.length
  }
  
  obj.removePlayer = function (nick) {
    players.remove(players.indexOf(nick))
    countPlayers = players.length
  }
  
  obj.countPlayers = function () {
    return countPlayers
  }
  
  obj.getPlayerList = function () {
    return players
  }
  
  obj.toObject = function () {
    return {
      name: obj.name,
      countPlayers: countPlayers
    }
  }
  
  return obj
}

function SocketController(io, client) {
  var obj = {}
  
  // put error logging in a central function
  function errorHandler(fn) {
    return function (err) {
      if (err) {
        console.log(err)
        client.emit('notify error', 'A server error occured. Please reload the game.')
      } else if (fn instanceof Function) {
        fn.apply(this, Array.prototype.slice.call(arguments, 1))
      }
    }
  }
  
  obj.set = function (key, value, fn) {
    client.set(key, value, errorHandler(fn))
  }
  
  obj.get = function (key, fn) {
    client.get(key, errorHandler(fn))
  }
  
  return obj
}

var players = [], games = {}, yahtzee = Yahtzee()
io.sockets.on('connection', function (client) {
  var ctr = SocketController(io, client)
  
  client.on('add player', function (nick) {
    if (players.indexOf(nick) > -1) {
      client.emit('notify error', 'nickname "' + nick + '" already in use')
    } else {
      ctr.set('player', { name: nick, points: [], game: null }, function () {
        players.push(nick)
        client.emit('player added', nick)
      })
    }
  })
  
  client.on('disconnect', function () {
    ctr.get('player', function (player) {
      var game = player.game
      if (game) {
        if (games[game.name].countPlayers() < 2) {
          delete games[game.name]
          io.sockets.emit('game removed', game.name)
        } else {
          game.removePlayer(player.name)
          io.sockets.emit('game changed', game.toObject())
          io.sockets.in(game.name).emit('player left', player.name)
        }
      }
      players.remove(players.indexOf(player.name))
    })
  })
  
  client.on('join game', function (name) {
    ctr.get('player', function (player) {
      var game, nick = player.name
      if (!games[name]) {
        game = games[name] = Game(name, client)
      }
      if (!games[name].isRunning) {
        game.addPlayer(nick)
        io.sockets.to(game.name).
      }
    })
  })
  
  client.on('leave game', function (name) {
    ctr.get('player', function (player) {
      var nick = player.name
      var game = player.game
      if (games[game.name].countPlayers() < 2) {
        delete game[game.name]
        io.sockets.emit('game removed', game.name)
      } else {
        game.removePlayer(nick)
        io.sockets.emit('game changed', game.toObject())
      }
      player.game = null
    }))
  })
  
  client.on('start', function () {
    ctr.get('player', function (player) {
      var game = games[player.game.name]
      if (player !== game.starter) return
      
      game.isRunning = true
    })
  })
  
  client.on('next', function () {
    ctr.get('player', function (player) {
      player.isActive = false
      
    })
  })
  
  client.on('throw', function (dices) {
    ctr.get('player', function (player) {
      if (!player.isActive) return
      var thrownDices = yahtzee.throwDices()
      if (thrownDices) {
        client.emit('can be saved', yahtzee.indicesCanBeSaved())
        io.sockets.to('thrown', player.name, thrownDices)
      } else {
        client.emit('notify error', 'you cannot throw again')
      }
    })
  })
  
  client.on('save', function (index) {
    ctr.get('player', function (player) {
      if (!player.isActive) return
      
      
    })
  })
  
  client.on('disable', function (index) {
    ctr.get('player', function (player) {
      if (!player.isActive) return
      
      
    })
  })
  
});




