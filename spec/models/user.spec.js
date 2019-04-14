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
  let user

  beforeEach(() => {
    user = _cloneDeep(mockUser)
  })

  it(`should validate 'username' type`, async () => {
    user.username = { wrong: 'type' }
    const u = new User(user)
    await expect(u.validate()).rejects
      .toThrow(/User validation failed: username/)
  })
})
