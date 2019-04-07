'use strict'

const parseSkill = require('../../src/utils/skills-parser')

jest.mock('../../src/utils/skillsdictionary', () => ({
  'parsed mockSkill': ['mockskill']
}))

describe('parseSkill', () => {
  it('should return the requested string if not found', () => {
    const requested = 'leroy'
    const actual = parseSkill(requested)
    expect(actual).toEqual(requested)
  })

  it('should parse requested string if found in dictionary', () => {
    const requested = 'mockSkill'
    const actual = parseSkill(requested)
    expect(actual).toEqual('parsed mockSkill')
  })
})
