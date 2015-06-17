var chessFactory = require('./chess_js')
var chess
var domReady = require('domready')
var boardFactory = require('chessground')
// var $ = jQuery = require('jquery')
function chessToColor(chess) {
  return (chess.turn() == "w") ? "white" : "black";
}
function chessToDests(chess) {
  var dests = {};
  chess.SQUARES.forEach(function(s) {
    var ms = chess.moves({square: s, verbose: true});
    if (ms.length) dests[s] = ms.map(function(m) { return m.to; });
  });
  return dests;
}

var onMove = function(orig, dest) {
  chess.move({from: orig, to: dest});
  ground.set({
    turnColor: chessToColor(chess),
    movable: {
      color: chessToColor(chess),
      dests: chessToDests(chess)
    }
  });
}

function getBoardOptions(chess, orientation, viewOnly) {
  return {
    orientation: orientation,
    viewOnly: viewOnly,
    turnColor: 'white',
    animation: {
      duration: 500
    },
    movable: {
      free: false,
      color: chessToColor(chess),
      premove: true,
      dests: chessToDests(chess),
      events: {
        after: onMove
      }
    },
    drawable: {
      enabled: true
    }
  }
}

domReady(function(){
  game1 = new chessFactory.Chess(undefined, true)
  game2 = new chessFactory.Chess(undefined, true)
  board1 = boardFactory(document.getElementById('board1'), getBoardOptions(game1, 'white', false))
  board2 = boardFactory(document.getElementById('board2'), getBoardOptions(game2, 'black', true))
});
