const _cloneDeep = require('lodash/cloneDeep')
const Connection = require('../../src/models/connection')

describe(`Connection model`, () => {
  let conn
  const mockConnection = {
    conversationId: 'mockConversationId',
    mentor: {
      id: 'mockMentorId',
      name: 'mockMentorName',
      avatar: 'mockMentorAvatar'
    },
    mentee: {
      id: 'mockMenteeId',
      name: 'mockMenteeName',
      avatar: 'mockMenteeAvatar'
    },
    initiator: {
      id: 'mockInitiatorId',
      name: 'mockInitiatorName'
    },
    dateAccepted: new Date(),
    dateDeclined: new Date(),
    dateStarted: new Date(),
    dateEnded: new Date(),
    originalPost: {
      id: 'mockOriginalPostId',
      title: 'mockOriginalPostTitle'
    },
    status: 'pending'
  }

  beforeEach(() => {
    conn = _cloneDeep(mockConnection)
  })

  it(`should validate 'mentor.id'`, async () => {
    delete conn.mentor.id
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*mentor.id.*required/)
  })

  it(`should validate 'mentor.name'`, async () => {
    delete conn.mentor.name
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*mentor.name.*required/)
  })

  it(`should validate 'mentee.id'`, async () => {
    delete conn.mentee.id
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*mentee.id.*required/)
  })

  it(`should validate 'mentee.name'`, async () => {
    delete conn.mentee.name
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*mentee.name.*required/)
  })

  it(`should validate 'initiator.id'`, async () => {
    delete conn.initiator.id
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*initiator.id.*required/)
  })

  it(`should validate 'initiator.name'`, async () => {
    delete conn.initiator.name
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*initiator.name.*required/)
  })

  it(`should validate 'originalPost.id'`, async () => {
    delete conn.originalPost.id
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*originalPost.id.*required/)
  })

  it(`should validate 'originalPost.title'`, async () => {
    delete conn.originalPost.title
    const c = new Connection(conn)
    await expect(c.validate()).rejects
      .toThrow(/Connection validation failed.*originalPost.title.*required/)
  })
})

describe(`Connection model static methods`, () => {
  beforeAll(() => {
    Connection.find = jest.fn(() => Connection)
    Connection.findOneAndUpdate = jest.fn(() => Connection)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`.findOwnConnections()`, () => {
    it(`should return array of connections on success`, async () => {
      expect.assertions(3)
      const target = 'abc123'
      Connection.exec = jest.fn().mockResolvedValue(expect.any(Array))
      const actual = await Connection.findOwnConnections({ target })
      expect(actual).toEqual(expect.any(Array))
      expect(Connection.find).toHaveBeenCalledTimes(1)
      expect(Connection.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: [{ 'mentor.id': target }, { 'mentee.id': target }]
      }))
    })

    it(`should throw when missing required 'target' param`, () => {
      expect(() => Connection.findOwnConnections({}))
        .toThrow(/Missing required target/)
      expect(Connection.find).not.toHaveBeenCalled()
    })
  })

  describe(`.updateConnectionStatus()`, () => {
    it(`should return connection object on success`, async () => {
      expect.assertions(3)
      const target = 'abc123'
      const type = 'ACCEPT'
      Connection.exec = jest.fn().mockResolvedValue(expect.any(Object))
      const actual = await Connection.updateConnectionStatus({ target, type })
      expect(actual).toEqual(expect.any(Object))
      expect(Connection.findOneAndUpdate).toHaveBeenCalledTimes(1)
      expect(Connection.findOneAndUpdate).toHaveBeenCalledWith(
        target,
        { status: 'accepted', dateAccepted: expect.any(Number) },
        { new: true }
      )
    })

    it(`should throw when missing required 'target' param`, () => {
      const type = 'ACCEPT'
      expect(() => Connection.updateConnectionStatus({ type }))
        .toThrow(/Missing required target/)
      expect(Connection.find).not.toHaveBeenCalled()
    })

    it(`should throw when missing required 'type' param`, () => {
      const target = 'abc123'
      expect(() => Connection.updateConnectionStatus({ target }))
        .toThrow(/Missing required type/)
      expect(Connection.find).not.toHaveBeenCalled()
    })
  })

  describe(`.getStatusFromType()`, () => {
    it(`should parse 'ACCEPT' action types`, () => {
      const type = 'ACCEPT'
      expect(Connection.getStatusFromType(type))
        .toEqual({ status: 'accepted', dateAccepted: expect.any(Number) })
    })

    it(`should parse 'DECLINE' action types`, () => {
      const type = 'DECLINE'
      expect(Connection.getStatusFromType(type))
        .toEqual({ status: 'declined', dateDeclined: expect.any(Number) })
    })

    it(`should parse 'DEACTIVATE' action types`, () => {
      const type = 'DEACTIVATE'
      expect(Connection.getStatusFromType(type))
        .toEqual({ status: 'inactive', dateExpired: expect.any(Number) })
    })

    it(`should parse unrecognized action types`, () => {
      const type = 'bananas'
      expect(Connection.getStatusFromType(type))
        .toEqual({ })
    })
  })
})
