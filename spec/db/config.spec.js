'use strict'

process.env.DB_UNAME = 'superdummy'
process.env.DB_PWD = 'superdummy'

const dbConfig = require('../../src/db/config')

jest.mock('dotenv', () => ({
  config: jest.fn()
}))

describe('db config', () => {
  it('should export env-specific connection objects', () => {
    expect(dbConfig.development).toEqual({
      url: `mongodb://127.0.0.1:27017`,
      dbName: 'co-ment-dev',
      options: { useNewUrlParser: true }
    })

    expect(dbConfig.testing).toEqual({
      url: `mongodb://${process.env.DB_UNAME}:${process.env.DB_PWD}@ds161503.mlab.com:61503`,
      dbName: 'co-ment-test',
      options: { useNewUrlParser: true }
    })

    expect(dbConfig.production).toEqual({
      url: `mongodb://${process.env.DB_UNAME}:${process.env.DB_PWD}@ds127983.mlab.com:27983`,
      dbName: 'co-ment',
      options: { useNewUrlParser: true }
    })
  })
})
