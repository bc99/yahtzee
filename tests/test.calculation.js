
describe('calculate points', function() {

  it('should represent sum of an array', function () {
    assert(6 === sum([1,2,3]), '6 === sum([1,2,3])')
  })
  
  it('should represents the number of dices', function () {
    assert(5 === getStraight([1,2,3,4,5]), '5 === getStraight([1,2,3,4,5])')
    assert(5 === getStraight([2,3,4,5,6]), '5 === getStraight([2,3,4,5,6])')
    assert(4 === getStraight([1,2,3,4]), '4 === getStraight([1,2,3,4])')
    assert(4 === getStraight([2,3,4,5]), '4 === getStraight([2,3,4,5])')
    assert(4 === getStraight([3,4,5,6]), '4 === getStraight([3,4,5,6])')
  })

})

