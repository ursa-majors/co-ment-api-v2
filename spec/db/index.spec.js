'use strict'

const dbIndex = require('../../src/db/index')

jest.mock('../../src/db/config', () => ({
  test: {
    url: 'dingleberries',
    dbName: 'co-ment-dev',
    options: { useNewUrlParser: true }
  }
}))

describe('db index', () => {
  it('should export object of methods', () => {
    expect(dbIndex).toEqual({
      getConnectionString: expect.any(Function),
      getConnectionOptions: expect.any(Function)
    })
  })

  it('getConnectionString should return env-specific connection string', () => {
    expect(dbIndex.getConnectionString()).toEqual('dingleberries/co-ment-dev')
  })

  it('getConnectionString should return env-specific connection string', () => {
    expect(dbIndex.getConnectionOptions()).toEqual({ useNewUrlParser: true })
  })
})
