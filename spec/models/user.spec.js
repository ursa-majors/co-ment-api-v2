const _cloneDeep = require('lodash/cloneDeep')
const User = require('../../src/models/user')

const mockUser = {
  username: 'mockUserName',
  email: 'test@example.com',
  name: 'Leroy',
  ghUserName: '098asdlkj2309asd',
  avatarUrl: 'http://example.com/avatarUrl',
  location: 'mock location',
  about: 'mock about',
  gender: 'mock gender',
  github: 'http://example.com/github',
  twitter: 'http://example.com/twitter',
  facebook: 'http://example.com/facebook',
  link: 'http://example.com/link',
  linkedin: 'http://example.com/linkedin',
  codepen: 'http://example.com/codepen',
  signupKey: { key: 'some string', ts: 'some string', exp: 'some string' },
  passwordResetKey: { key: 'some string', ts: 'some string', exp: 'some string' },
  validated: true,
  languages: ['mock language'],
  certs: ['mock certs'],
  skills: ['mock skill'],
  time_zone: 'UTC-0',
  likedPosts: [],
  contactMeta: {
    unSubbed: false,
    alreadyContacted: false
  },
  engagementMeta: {
    addPostReminder: new Date().toISOString(),
    addProfileReminder: new Date().toISOString()
  },
  hash: '098asdkhjqwe987234khd9872q3l4khja0d9l2hj409uas',
  salt: '098asdkhjqwe987234khd9872q3l4khja0d9l2hj409uas'
}

describe(`User model`, () => {
  let testUser

  beforeEach(() => {
    testUser = _cloneDeep(mockUser)
  })

  describe('username validations', () => {
    const errMsg = /User validation failed: username/

    it(`should be OK with valid usernames`, async () => {
      testUser.username = 'this_IS-valid666'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error if missing`, async () => {
      delete testUser.username
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid type`, async () => {
      testUser.username = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with no length`, async () => {
      testUser.username = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 32 chars`, async () => {
      testUser.username = '0123456789abcdef0123456789abcdef!'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with leading numbers`, async () => {
      testUser.username = '6_no_leading_numbers'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with leading underscore`, async () => {
      testUser.username = '_no_leading_underscore'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with inner whitespace`, async () => {
      testUser.username = 'no spaces'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('email validations', () => {
    const errMsg = /User validation failed: email/

    it(`should be OK with valid email addresses`, async () => {
      testUser.email = 'this_IS@valid-email.com'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should lowercase valid email addresses`, async () => {
      testUser.email = 'THIS_IS@UPPER-CASE.com'
      const u = new User(testUser)
      await expect(u.validate()).resolves
      expect(u.email).toEqual(testUser.email.toLowerCase())
    })

    it(`should error if missing`, async () => {
      delete testUser.email
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid type`, async () => {
      testUser.email = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on email with no length`, async () => {
      testUser.email = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 64 chars`, async () => {
      testUser.email = 'this_is_a_long_email_address@some-huge-domain-name-really-wow.com'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid string pattern`, async () => {
      testUser.email = 'not-an-email.com'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('name validations', () => {
    const errMsg = /User validation failed: name/

    it(`should be OK with valid name`, async () => {
      testUser.name = 'Test User Name'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should permit non-ASCII characters`, async () => {
      testUser.name = 'Andrés Düsseldorf Москва Köln'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.name = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on email with no length`, async () => {
      testUser.name = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 64 chars`, async () => {
      testUser.name = 'this name is otherwise valid but waaaaaaaaaaaaaaaaaaaaay too long'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with < brackets >`, async () => {
      testUser.name = '<cant have brackets>'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with { curly braces }`, async () => {
      testUser.name = '{cant have braces}'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with ( parens )`, async () => {
      testUser.name = 'functionCall()'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with $ signs`, async () => {
      testUser.name = '$set: { fail: true }'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })
})
