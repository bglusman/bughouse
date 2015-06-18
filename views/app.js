var chessFactory = require('./chess_js')
var chess
var domReady = require('domready')
var boardFactory = require('chessground')
var jQuery = require('jQuery')
var observe = require('../Object.observe.poly')
var pieceMap = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen'
}
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

var onMove = function(chess, white_capture_destination, black_capture_destination, var_name) {
  return function(orig, dest){
    result = chess.move({from: orig, to: dest});
    eval(var_name).set({
      turnColor: chessToColor(chess),
      movable: {
        color: chessToColor(chess),
        dests: chessToDests(chess)
      }
    });
    if (result.captured && result.color == "b") {
      white_capture_destination.push(result.captured)
    } else if (result.captured && result.color == "w") {
      black_capture_destination.push(result.captured)
    }
  }
}

function getBoardOptions(chess, white_capture_destination, black_capture_destination, var_name, orientation, viewOnly) {
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
        after: onMove(chess, white_capture_destination, black_capture_destination, var_name)
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
  game1.white_spares = []
  game1.black_spares = []
  game2.white_spares = []
  game2.black_spares = []

  board1 = boardFactory(document.getElementById('board1'), getBoardOptions(game1, game2.white_spares, game2.black_spares, 'board1', 'white', false))
  board2 = boardFactory(document.getElementById('board2'), getBoardOptions(game2, game1.white_spares, game1.black_spares, 'board2', 'black', false))
  var makeOnSpareChange = function(color, game_class){
    var resultFunc = function(changes){
      var change = changes[0]
      var index = change.name
      var piece = change.object[index]
      jQuery('.'+ game_class + ' .' + color + '_spares').append(
          "<div class='spare-piece "+ pieceMap[piece] +" " + color + "'></div>"
        )
    }
    return resultFunc
  }

  Object.observe(game1.white_spares, makeOnSpareChange('white', 'game1') )
  Object.observe(game2.white_spares, makeOnSpareChange('white', 'game2') )
  Object.observe(game1.black_spares, makeOnSpareChange('black', 'game1') )
  Object.observe(game2.black_spares, makeOnSpareChange('black', 'game2') )
});
