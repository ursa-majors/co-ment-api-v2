'use strict'

const Connection = require('../../../src/models/connection')
const updateConnection = require('../../../src/controllers/connection/update-connection')

jest.mock('../../../src/models/connection')

const connId = 'abcd1234'
const type = 'accepted'

describe('getConnections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return updated connection on success', async () => {
    Connection.updateConnectionStatus = jest.fn().mockResolvedValue({ status: 'accepted' })
    const actual = await updateConnection({ connId, type })
    expect(actual).toEqual(expect.objectContaining({
      status: type
    }))
  })

  it('should throw if missing connId', async () => {
    await expect(updateConnection({ type })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required connId'
      }))
  })

  it('should throw if missing userId', async () => {
    await expect(updateConnection({ connId })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required type'
      }))
  })

  it('should throw if called with no arguments', async () => {
    await expect(updateConnection()).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required connId'
      }))
  })

  it('should handle DB errors', async () => {
    Connection.updateConnectionStatus = jest.fn().mockRejectedValue(new Error('Boom'))
    await expect(updateConnection({ connId, type })).rejects
      .toThrow(/Boom/)
  })
})
