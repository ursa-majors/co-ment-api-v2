'use strict'

const { Writable } = require('stream')
const Log = require('../../src/models/log')
const DbLogStream = require('../../src/utils/DbLogStream')

jest.mock('../../src/models/log', () => jest.fn())

const msg = { msg: 'some message' }
const msgString = JSON.stringify(msg)

describe('DbLogStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be a constructor', () => {
    const dbLogStream = new DbLogStream({ model: Log })
    expect(dbLogStream).toBeInstanceOf(DbLogStream)
  })

  it('should inherit from Node Writable', () => {
    const dbLogStream = new DbLogStream({ model: Log })
    expect(dbLogStream).toBeInstanceOf(Writable)
  })

  it('constructor should throw if options missing DB model', () => {
    expect(() => new DbLogStream({}))
      .toThrow(/Missing required model param/)
  })

  it('constructor should throw if options missing', () => {
    expect(() => new DbLogStream())
      .toThrow(/Missing required model param/)
  })

  it('should write stream chunks to database', (done) => {
    const mockSave = jest.fn().mockResolvedValue({})
    Log.mockImplementation(() => ({
      save: mockSave
    }))
    const dbLogStream = new DbLogStream({ model: Log })

    dbLogStream.write(msgString, () => {
      expect(mockSave).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('should handle database errors', (done) => {
    const errMsg = 'boom'
    const mockSave = jest.fn().mockRejectedValue(new Error(errMsg))
    Log.mockImplementation(() => ({
      save: mockSave
    }))
    const dbLogStream = new DbLogStream({ model: Log })

    dbLogStream.on('error', function (err) {
      expect(err).toEqual(expect.any(Error))
      expect(err.message).toEqual(errMsg)
      done()
    })

    dbLogStream.write(msgString)

    expect(mockSave).toHaveBeenCalledTimes(1)
  })
})
