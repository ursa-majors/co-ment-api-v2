'use strict'

const Connection = require('../../../src/models/connection')
const createConnection = require('../../../src/controllers/connection/create-connection')

jest.mock('../../../src/models/connection', () => jest.fn())

describe('createConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return new connection on success', async () => {
    expect.assertions(3)
    const body = {}
    const mockConnection = {
      save: jest.fn().mockReturnValue({ _id: 'someConnectionId' })
    }
    Connection.mockImplementation(() => mockConnection)
    const actual = await createConnection({ body })
    expect(actual).toEqual({
      message: 'Connection created',
      connectionId: 'someConnectionId'
    })
    expect(mockConnection.dateStarted).toEqual(expect.any(Number))
    expect(mockConnection.save).toHaveBeenCalledTimes(1)
  })

  it('should throw if missing body', async () => {
    await expect(createConnection()).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required body'
      }))
  })

  it('should handle DB errors', async () => {
    expect.assertions(3)
    const body = {}
    const mockConnection = {
      save: jest.fn(() => { throw new Error('boom') })
    }
    Connection.mockImplementation(() => mockConnection)
    await expect(createConnection({ body })).rejects
      .toThrow(/boom/)
    expect(mockConnection.dateStarted).toEqual(expect.any(Number))
    expect(mockConnection.save).toHaveBeenCalledTimes(1)
  })
})
