const _cloneDeep = require('lodash/cloneDeep')
const Log = require('../../src/models/log')

describe(`Log model`, () => {
  let log
  const mockLog = {
    category: 'engagement_email',
    affectedUsers: [{
      email: 'mockUserEmail',
      username: 'mockUserUsername',
      name: 'mockUserName',
      _id: 'mockUserId'
    }],
    actionTaken: 'mockAction'
  }

  beforeEach(() => {
    log = _cloneDeep(mockLog)
  })

  it(`should validate 'category' existence`, async () => {
    delete log.category
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*category.*required/)
  })

  it(`should validate 'category' type`, async () => {
    log.category = ['arrays are not strings']
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*not a valid enum value/)
  })

  it(`should validate 'affectedUsers' type`, async () => {
    log.affectedUsers = ['strings are not objects']
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed: affectedUsers: Cast to Array failed/)
  })

  it(`should validate 'actionTaken' existence`, async () => {
    delete log.actionTaken
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed.*actionTaken.*required/)
  })

  it(`should validate 'actionTaken' type`, async () => {
    log.actionTaken = { this: 'is not a string' }
    const l = new Log(log)
    await expect(l.validate()).rejects
      .toThrow(/Log validation failed: actionTaken/)
  })
})
