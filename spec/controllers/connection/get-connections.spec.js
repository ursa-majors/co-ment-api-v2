'use strict'

const Connection = require('../../../src/models/connection')
const getConnections = require('../../../src/controllers/connection/get-connections')

jest.mock('../../../src/models/connection')

describe('getConnections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return new connection on success', async () => {
    const userId = 'abcd1234'
    Connection.findOwnConnections = jest.fn().mockResolvedValue([])
    const actual = await getConnections({ userId })
    expect(actual).toEqual(expect.any(Array))
  })

  it('should throw if missing userId', async () => {
    await expect(getConnections()).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId'
      }))
  })

  it('should handle DB errors', async () => {
    const userId = 'abcd1234'
    Connection.findOwnConnections = jest.fn().mockRejectedValue(new Error('Boom'))
    await expect(getConnections({ userId })).rejects
      .toThrow(/Boom/)
  })
})
