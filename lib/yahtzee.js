
var _ = require('underscore')

function YahtzeeTurn() {
  const THREE_OF_A_KIND = 6,
        FOUR_OF_A_KIND  = 7,
        FULL_HOUSE      = 8,
        SMALL_STRAIGHT  = 9,
        LARGE_STRAIGHT  = 10,
        YAHTZEE         = 11,
        CHANCE          = 12

  var obj           = {}
    , currentPlayer = null
    , thrown        = 0
    , dices         = []
    , chosenDices   = 0
    , checkedValues = []
    , turnEnded     = false
  
  function sum(arr) { return _.reduce(arr, function (memo, num) { return memo + num }) }

  function getStraight(dices) {
    var sorted = _.sortBy(dices, function (num) { return num })
    var straight = 0
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i] + 1 === sorted[i+1]){
        if (straight === 0) straight = 1 
        straight++
      }
    }
    return straight
  }

  function smallStraight(dices) { return getStraight(dices) >= 4 }
  function largeStraight(dices) { return getStraight(dices) === 5 }

  function countSimilarDices(dices) {
    var results = []
    for (var i = 0; i < dices.length; i++) {
      if (isNaN(results[dices[i]])) {
        results[dices[i]] = 0
      }
      results[dices[i]] += 1
    }
    return results
  }

  function manyOfAKind(dices, num) {
    var results = countSimilarDices(dices)
    for (var k in results) {
      if (results.hasOwnProperty(k)){
        if (results[k] >= num) return true
      }
    }
    return false
  }

  function getAmountOfSimilarDices(dices, num) {
    var results = countSimilarDices(dices)
    return results[num] ? results[num] : 0
  }

  function threeOfAKind(dices) { return manyOfAKind(dices, 3) }
  function fourOfAKind(dices) { return manyOfAKind(dices, 4) }
  function yahtzee(dices) { return manyOfAKind(dices, 5) }

  function fullHouse(dices) {
    var results = countSimilarDices(dices)
    return results.indexOf(2) > -1 && results.indexOf(3) > -1
  }

  // verify the field is not set with a numeric value.
  function isWriteable(index) {
    return typeof currentPlayer.points[index] === 'undefined'
  }
  
  // verify the field can be filled with
  // one of the possible options
  function canBeSaved(index) {
    if (typeof checkedValues[index] === 'undefined') {
      checkedValues[index] = thrown > 0 &&
      (
             (index >= 0 && index <= 5)
          || (index === CHANCE)
      ) || (
        chosenDices === 5 && (
             (index === THREE_OF_A_KIND && threeOfAKind(dices))
          || (index === FOUR_OF_A_KIND  && fourOfAKind(dices))
          || (index === FULL_HOUSE      && fullHouse(dices))
          || (index === SMALL_STRAIGHT  && smallStraight(dices))
          || (index === LARGE_STRAIGHT  && largeStraight(dices))
          || (index === YAHTZEE         && yahtzee(dices))
        )
      )
    }
    return checkedValues[index]
  }
  
  function calculatePoints(index) {
    var result = currentPlayer.points[index]
    if (isWriteable(index)) {
      if (index >= 0 && index <= 5 && canBeSaved(index)) {
        // sum of similar numbers by index (from 1 to 6)
        result = getAmountOfSimilarDices(dices, index + 1) * (index + 1)
      }
      else if (canBeSaved(index)) {
        switch (index) {
          case THREE_OF_A_KIND:
            result = sum(dices)
            break
          case FOUR_OF_A_KIND:
            result = sum(dices)
            break
          case FULL_HOUSE:
            result = 25
            break
          case SMALL_STRAIGHT:
            result = 30
            break
          case LARGE_STRAIGHT:
            result = 40
            break
          case YAHTZEE:
            result = 50
            break
          case CHANCE:
            result = sum(dices)
        }
      }
    }
    return result
  }
  
  // change the player object and reset the turn.
  obj.changePlayer = function (player) {
    currentPlayer = player
    thrown        = 0
    dices         = []
    chosenDices   = 0
    checkedValues = []
    turnEnded     = false
  }
  
  // the player throws the selected dices (diceIndices)
  // and return the dices array
  obj.throwDices = function (diceIndices) {
    chosenDices = diceIndices.length
    if (thrown < 3 && chosenDices > 0) {
      for (var k in diceIndices) {
        if (diceIndices.hasOwnProperty(k)) {
          dices[diceIndices[k]] = _.random(1,6)
        }
      }
      thrown++
      return dices
    }
    return false
  }
  
  obj.indicesCanBeSaved = function () {
    for (var i = 0; i < 13; i++) {
      if (isWriteable(i)) {
        // caching! We only need check once after dices are thrown.
        canBeSaved(i)
      }
    }
    return checkedValues
  }
  
  // save turn points and return them
  obj.saveInField = function (index) {
    if (!turnEnded && isWriteable(index)) {
      currentPlayer.points[index] = calculatePoints(index)
      turnEnded = true
      return true
    }
    return false
  }
  
  // force set points to 0 and return the value
  obj.disableField = function (index) {
    if (!turnEnded && isWriteable(index)) {
      currentPlayer.points[index] = 0
      turnEnded = true
      return true
    }
    return false
  }
  
  return obj
}

module.exports = YahtzeeTurn

