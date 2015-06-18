var chessFactory = require('./chess_js')
var domReady = require('domready')
var boardFactory = require('chessground')
var jQuery = require('jQuery')
var $ = jQuery
var promotion = 'q'
require('../Object.observe.poly')
var pieceMap = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king'
}
function getColor (color) {
  return color === 'w' ? 'white' : 'black'
}

function chessToColor (chess) {
  return (chess.turn() === 'w') ? 'white' : 'black'
}
function chessToDests (chess) {
  var dests = {}
  chess.SQUARES.forEach(function (s) {
    var ms = chess.moves({square: s, verbose: true})
    if (ms.length) dests[s] = ms.map(function (m) { return m.to })
  })
  return dests
}

var makeOnMove = function (chess, white_capture_destination, black_capture_destination, game_num) {
  var var_name = 'board' + game_num
  var game_name = 'game' + game_num
  return function(orig, dest){
    var board = eval(var_name)
    if (dest.match(/8/) || dest.match(/1/)){
      $(document).one('keydown', function(event){//sigh, not working
        switch (event.which) {
          case 75: promotion = 'n'
        }
      })
    }

    result = chess.move({from: orig, to: dest, promotion: promotion})
    // console.log(result)
    if (result && result.promotion) {
      var promotion_details = {color: getColor(result.color), role: pieceMap[promotion]}
      var object = {}
      object[dest] = promotion_details
      // debugger
      board.setPieces(object);
      //TODO: mark pawn for demotion on capture
    }

    board.set({
      turnColor: chessToColor(chess),
      movable: {
        color: chessToColor(chess),
        dests: chessToDests(chess)
      }
    });
    if(result && result.color == "b"){

    } else {

    }

    if (result && result.captured && result.color == "b") {
      white_capture_destination.push(result.captured)
    } else if (result && result.captured && result.color == "w") {
      black_capture_destination.push(result.captured)
    }
  }
}

function getBoardOptions (chess, white_capture_destination, black_capture_destination, game_num, orientation, viewOnly) {
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
        after: makeOnMove(chess, white_capture_destination, black_capture_destination, game_num)
      }
    },
    drawable: {
      enabled: true
    }
  }
}

domReady(function(){
  var game1 = new chessFactory.Chess(undefined, true)
  var game2 = new chessFactory.Chess(undefined, true)
  game1.white_spares = []
  game1.black_spares = []
  game2.white_spares = []
  game2.black_spares = []

  board1 = boardFactory(document.getElementById('board1'), getBoardOptions(game1, game2.white_spares, game2.black_spares, 1, 'white', false))
  board2 = boardFactory(document.getElementById('board2'), getBoardOptions(game2, game1.white_spares, game1.black_spares, 2, 'black', false))
  var makeOnSpareChange = function(color, game_class){
    var resultFunc = function(changes){
      var change = changes[0]
      var index = change.name
      var piece = change.object[index]
      if (typeof(pieceMap[piece]) == 'undefined') {
        debugger;
      }
      $('.'+ game_class + ' .' + color + '_spares').append(
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
