
describe('calculate points', function() {

  it('should represent sum of an array', function () {
    assert(6 === sum([1,2,3]), '6 === sum([1,2,3])')
  })
  
  it('should represents the number of dices', function () {
    assert(5 === getStraight([1,2,3,4,5]), '5 === getStraight([1,2,3,4,5])')
    assert(5 === getStraight([2,3,4,5,6]), '5 === getStraight([2,3,4,5,6])')
    assert(5 === getStraight([1,4,5,2,3]), '5 === getStraight([1,4,5,2,3])')
    assert(4 === getStraight([1,2,3,4,6]), '4 === getStraight([1,2,3,4,6])')
    assert(4 === getStraight([3,4,5,6,1]), '4 === getStraight([3,4,5,6,1])')
    assert(4 === getStraight([2,3,4,5,5]), '4 === getStraight([2,3,4,5,5])')
  })
  
  it('should represents many of a kind', function () {
    assert(true === manyOfAKind([1,1,6,3,1], 1), 'true === getManyOfAKind([1,1,6,3,1], 1)')
    assert(false === manyOfAKind([1,1,6,3,1], 4), 'false === getManyOfAKind([1,1,6,3,1], 4)')
    assert(true === manyOfAKind([6,6,2,6,4], 3), 'true === manyOfAKind([6,6,2,6,4], 3)')
  })
  
  it('should represents the amount of a special number in an array', function () {
    assert(1 === getAmountOfArrayNumber([1,2,3,4,5], 1), '1 === getAmountOfArrayNumber([1,2,3,4,5], 1)')
    assert(2 === getAmountOfArrayNumber([1,1,2,3,4], 1), '2 === getAmountOfArrayNumber([1,1,2,3,4], 1)')
    assert(3 === getAmountOfArrayNumber([1,1,1,2,3], 1), '3 === getAmountOfArrayNumber([1,1,1,2,3], 1)')
    assert(4 === getAmountOfArrayNumber([1,1,1,1,2], 1), '4 === getAmountOfArrayNumber([1,1,1,1,2], 1)')
    assert(0 === getAmountOfArrayNumber([1,1,1,1,2], 3), '0 === getAmountOfArrayNumber([1,1,1,1,2], 3)')
  })
  
  it('should represents a full house', function () {
    assert(true === fullHouse([1,1,2,2,2]), 'true === fullHouse([1,1,2,2,2])')
    assert(false === fullHouse([1,1,3,2,2]), 'false === fullHouse([1,1,3,2,2])')
  })

})

