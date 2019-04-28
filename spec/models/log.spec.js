const _cloneDeep = require('lodash/cloneDeep')
const Log = require('../../src/models/log')

describe(`Log model`, () => {
  let log
  const mockLog = {
    msg: 'Resolved GET >> 200 OK',
    requestId: 'b56c30c6-1960-403b-858b-c588b21d519f',
    level: 30,
    name: 'co/ment API',
    time: '2019-04-28T13:02:00.966Z',
    data: { userId: '5c89e3185e0f4b215d29d08a' }
  }

  beforeEach(() => {
    log = _cloneDeep(mockLog)
  })

  it(`should validate 'msg' existence`, async () => {
    delete log.msg
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*msg.*required/)
  })

  it(`should cast non-string 'msg's to valid strings`, async () => {
    log.msg = false
    const l = new Log(log)
    await expect(l.validate()).resolves.toBeUndefined()
    expect(l.msg).toEqual('false')
  })

  it(`should validate 'requestId' existence`, async () => {
    delete log.requestId
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*requestId.*required/)
  })

  it(`should cast non-string 'requestId's to valid strings`, async () => {
    log.requestId = false
    const l = new Log(log)
    await expect(l.validate()).resolves.toBeUndefined()
    expect(l.requestId).toEqual('false')
  })

  it(`should validate 'level' existence`, async () => {
    delete log.level
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*level.*required/)
  })

  it(`should validate 'level' type`, async () => {
    log.level = [false, 'not a number']
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed: level: Cast to Number failed/)
  })

  it(`should validate 'name' existence`, async () => {
    delete log.name
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*name.*required/)
  })

  it(`should cast non-string 'name's to valid strings`, async () => {
    log.name = false
    const l = new Log(log)
    await expect(l.validate()).resolves.toBeUndefined()
    expect(l.name).toEqual('false')
  })

  it(`should validate 'time' existence`, async () => {
    delete log.time
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*time.*required/)
  })

  it(`should cast non-string 'time's to valid strings`, async () => {
    log.time = false
    const l = new Log(log)
    await expect(l.validate()).resolves.toBeUndefined()
    expect(l.time).toEqual('false')
  })
})
