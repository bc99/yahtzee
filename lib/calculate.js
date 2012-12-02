
function sum(arr) {
  return _.reduce(arr, function (memo, num) { return memo + num })
}

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

function isSmallStraight(dices) {
  return getStraight(dices) >= 4
}

function isLargeStraight(dices) {
  return getStraight(dices) === 5
}

function getSameCount(dices) {
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
  var results = getSameCount(dices)
  for (var k in results) {
    if (results.hasOwnProperty(k)){
      if (results[k] >= num) return true
    }
  }
  return false
}

function getAmountOfArrayNumber(dices, num) {
  var results = getSameCount(dices)
  return results[num] ? results[num] : 0
}

function threeOfAKind(dices) {
  return manyOfAKind(dices, 3)
}

function fourOfAKind(dices) {
  return manyOfAKind(dices, 4)
}

function yahtzee(dices) {
  return manyOfAKind(dices, 5)
}

function fullHouse(dices) {
  var results = getSameCount(dices)
  return results.indexOf(2) > -1 && results.indexOf(3) > -1
}

module.exports = {
  sum: sum,
  getStraight: getStraight,
  isSmallStraight: isSmallStraight,
  isLargeStraight: isLargeStraight,
  getSameCount: getSameCount,
  manyOfAKind: manyOfAKind,
  getAmountOfArrayNumber: getAmountOfArrayNumber,
  threeOfAKind: threeOfAKind,
  fourOfAKind: fourOfAKind,
  yahtzee: yahtzee,
  fullHouse: fullHouse
}

