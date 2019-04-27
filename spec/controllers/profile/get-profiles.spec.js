'use strict'

const User = require('../../../src/models/user')
const getProfiles = require('../../../src/controllers/profile/get-profiles')

jest.mock('../../../src/models/user')

describe('getProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.find = jest.fn(() => User)
  })

  it('should return an array of user profiles', async () => {
    User.exec = jest.fn().mockResolvedValue(expect.any(Array))
    const actual = await getProfiles()
    expect(actual).toEqual(expect.any(Array))
  })

  it('should handle database errors', async () => {
    User.exec = jest.fn().mockRejectedValue(new Error('boom'))
    await expect(getProfiles()).rejects
      .toThrow(/boom/)
  })
})
