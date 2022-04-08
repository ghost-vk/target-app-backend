const { dateToDDMMYYYY } = require('../date')

describe('dateToDDMMYYYY', () => {
  test('Correct value', () => {
    const date = new Date('1990-02-15')
    expect(dateToDDMMYYYY(date)).toBe('15.02.1990')
  })

  test('Not a date type', () => {
    expect(dateToDDMMYYYY('1990-02-15')).toBe(false)
    expect(dateToDDMMYYYY(null)).toBe(false)
    expect(dateToDDMMYYYY(false)).toBe(false)
  })
})
