var chessFactory = require('./chess_js')
var domReady = require('domready')
var boardFactory = require('chessground')
var $ = jQuery = require('../jquery')
require('../jquery-ui')
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
var invertPieceMap = {
  pawn: 'p',
  knight: 'n',
  bishop: 'b',
  rook: 'r',
  queen: 'q',
  king: 'k'
}
var KEYCODE_K = 75, KEYCODE_k = 107, KEYCODE_n = 100, KEYCODE_N = 78, KEYCODE_Q = 81, KEYCODE_q = 113
$(document).on('keydown', function(event){
  switch (event.which) {
    case KEYCODE_k :
    case KEYCODE_K :
    case KEYCODE_n :
    case KEYCODE_N :
      $('.promotion').text('knight')
      promotion = 'n'
      break
    case KEYCODE_q :
    case KEYCODE_Q :
    $('.promotion').text('queen')
      promotion = 'q'
  }
})

function set_turn(game, color) {
    var tokens = game.fen().split(' ');
    tokens[1] = color;
    game.load(tokens.join(' '));
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

    result = chess.move({from: orig, to: dest, promotion: promotion})
    if (result && result.promotion) {
      var promotion_details = {color: getColor(result.color), role: pieceMap[promotion]}
      var object = {}
      object[dest] = promotion_details
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
      $('.' + game_name + ' .spare-piece.white' ).draggable()
      $('.' + game_name + ' .spare-piece.black' ).draggable('destroy')
    } else {
      $('.' + game_name + ' .spare-piece.black' ).draggable()
      $('.' + game_name + ' .spare-piece.white' ).draggable('destroy')
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
  function makeDropFunction(game, board){
    return function(event, ui) {
      var piece
      event.originalEvent.target.classList.forEach(function(klass){
        if (pieceName = invertPieceMap[klass]) {
          piece = pieceName
        }
      })
      var pieceLocation = this.classList[1]
      var pieceObject = {}
      game.put({ type: piece, color: game.turn() }, pieceLocation)
      pieceObject[pieceLocation] = {color: getColor(game.turn()), role: pieceMap[piece]}
      board.setPieces(pieceObject)
      console.log(pieceLocation)
      console.log(pieceObject, event)
      nextColor = game.turn() === 'w' ? 'b' : 'w'
      set_turn(game, nextColor)
      board.set({turnColor: getColor(nextColor),
                movable: { color: getColor(nextColor),
                dests: chessToDests(game)
                }
             })
      ui.draggable.remove()
    }
  }

  $(".game1 .cg-square" ).droppable({
    drop:makeDropFunction(game1, board1)
  });
  $(".game2 .cg-square" ).droppable({
    drop:makeDropFunction(game2, board2)
  });

});
