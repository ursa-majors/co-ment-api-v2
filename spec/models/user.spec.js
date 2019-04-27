// for generateJWT instance method test
process.env.JWT_SECRET = 'supersecret'

const _cloneDeep = require('lodash/cloneDeep')
const jwt = require('jsonwebtoken')
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
  hash: null,
  salt: null
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
      testUser.username = new Array(33).fill(0).join('')
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

    it(`should error on string with no length`, async () => {
      testUser.name = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 64 chars`, async () => {
      testUser.name = new Array(65).fill(0).join('')
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

  describe('ghUserName validations', () => {
    const errMsg = /User validation failed: ghUserName/

    it(`should be OK with valid name`, async () => {
      testUser.ghUserName = 'valid-USERname1'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should not permit non-ASCII characters`, async () => {
      testUser.ghUserName = 'Andrés Düsseldorf Москва Köln'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on email with no length`, async () => {
      testUser.ghUserName = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 39 chars`, async () => {
      testUser.ghUserName = new Array(40).fill(0).join('')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with leading dash`, async () => {
      testUser.ghUserName = '-no-leading-dashes'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with inner whitespace`, async () => {
      testUser.ghUserName = 'no spaces'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('location validations', () => {
    const errMsg = /User validation failed: location/

    it(`should be OK with valid location`, async () => {
      testUser.location = 'Test Location'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should permit non-ASCII characters`, async () => {
      testUser.location = 'Düsseldorf'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.location = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with no length`, async () => {
      testUser.location = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 64 chars`, async () => {
      testUser.location = new Array(65).fill(0).join('')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with < brackets >`, async () => {
      testUser.location = '<cant have brackets>'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with { curly braces }`, async () => {
      testUser.location = '{cant have braces}'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with ( parens )`, async () => {
      testUser.location = 'functionCall()'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on strings with $ signs`, async () => {
      testUser.location = '$set: { fail: true }'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('about validations', () => {
    const errMsg = /User validation failed: about/

    it(`should be OK with valid about`, async () => {
      testUser.about = 'Test about'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should permit non-ASCII characters`, async () => {
      testUser.about = 'Düsseldorf'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.about = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string with no length`, async () => {
      testUser.about = ''
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on string length > 512 chars`, async () => {
      testUser.about = new Array(513).fill(0).join('')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('avatarUrl validations', () => {
    const errMsg = /User validation failed: avatarUrl/

    it(`should be OK with valid avatarUrl`, async () => {
      testUser.avatarUrl = 'avatarUrl.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.avatarUrl = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.avatarUrl = 'avatarUrl/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('github validations', () => {
    const errMsg = /User validation failed: github/

    it(`should be OK with valid github`, async () => {
      testUser.github = 'github.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.github = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.github = 'github/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('twitter validations', () => {
    const errMsg = /User validation failed: twitter/

    it(`should be OK with valid twitter`, async () => {
      testUser.twitter = 'twitter.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.twitter = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.twitter = 'twitter/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('facebook validations', () => {
    const errMsg = /User validation failed: facebook/

    it(`should be OK with valid facebook`, async () => {
      testUser.facebook = 'facebook.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.facebook = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.facebook = 'facebook/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('link validations', () => {
    const errMsg = /User validation failed: link/

    it(`should be OK with valid link`, async () => {
      testUser.link = 'link.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.link = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.link = 'link/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('linkedin validations', () => {
    const errMsg = /User validation failed: linkedin/

    it(`should be OK with valid linkedin`, async () => {
      testUser.linkedin = 'linkedin.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.linkedin = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.linkedin = 'linkedin/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('codepen validations', () => {
    const errMsg = /User validation failed: codepen/

    it(`should be OK with valid codepen`, async () => {
      testUser.codepen = 'codepen.com/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.codepen = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on invalid URL`, async () => {
      testUser.codepen = 'codepen/abcdef'
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('languages validations', () => {
    const errMsg = /User validation failed: languages/

    it(`should be OK with valid languages`, async () => {
      testUser.languages = ['a', 'b', 'c']
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.languages = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on too many languages`, async () => {
      testUser.languages = new Array(65).fill('a')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on language too long`, async () => {
      const tooLongLang = new Array(65).fill('a').join('')
      testUser.languages = [tooLongLang]
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('certs validations', () => {
    const errMsg = /User validation failed: certs/

    it(`should be OK with valid certs`, async () => {
      testUser.certs = ['a', 'b', 'c']
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.certs = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on too many certs`, async () => {
      testUser.certs = new Array(65).fill('a')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on cert too long`, async () => {
      const tooLonCert = new Array(65).fill('a').join('')
      testUser.certs = [tooLonCert]
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('skills validations', () => {
    const errMsg = /User validation failed: skills/

    it(`should be OK with valid skills`, async () => {
      testUser.skills = ['a', 'b', 'c']
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.skills = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on too many skills`, async () => {
      testUser.skills = new Array(65).fill('a')
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })

    it(`should error on skill too long`, async () => {
      const tooLongSkill = new Array(65).fill('a').join('')
      testUser.skills = [tooLongSkill]
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })

  describe('time_zone validations', () => {
    const errMsg = /User validation failed: time_zone/

    it(`should be OK with valid time_zone`, async () => {
      testUser.time_zone = 'UTC-5'
      const u = new User(testUser)
      await expect(u.validate()).resolves
    })

    it(`should error on invalid type`, async () => {
      testUser.time_zone = { wrong: 'type' }
      const u = new User(testUser)
      await expect(u.validate()).rejects.toThrow(errMsg)
    })
  })
})

describe(`User model instance methods`, () => {
  let testUser

  beforeEach(() => {
    jest.clearAllMocks()
    testUser = _cloneDeep(mockUser)
  })

  describe(`.hashPassword()`, () => {
    it(`should generate 1024 hex char 'hash' from provided password`, () => {
      const plaintextPassword = 'plaintextPassword'
      const newUser = new User(testUser)
      const actual = newUser.hashPassword(plaintextPassword)

      expect(actual).toBeUndefined()
      expect(newUser.hash).toEqual(expect.stringMatching(/^[0-9a-f]{1024}$/i))
    })

    it(`should set 32 hex char 'salt' on user object`, () => {
      const plaintextPassword = 'plaintextPassword'
      const newUser = new User(testUser)
      const actual = newUser.hashPassword(plaintextPassword)

      expect(actual).toBeUndefined()
      expect(newUser.salt).toEqual(expect.stringMatching(/^[0-9a-f]{32}$/i))
    })
  })

  describe(`.validatePassword()`, () => {
    let newUser

    beforeEach(() => {
      const plaintextPassword = 'plaintextPassword'
      newUser = new User(testUser)
      newUser.hashPassword(plaintextPassword)
    })

    it(`should return 'true' if provided password hashes to stored hash`, () => {
      const actual = newUser.validatePassword('plaintextPassword')
      expect(actual).toBe(true)
    })

    it(`should return 'false' if provided password does not hashes to stored hash`, () => {
      const actual = newUser.validatePassword('wrongPassword')
      expect(actual).toBe(false)
    })
  })

  describe(`.generateJWT()`, () => {
    let newUser

    beforeEach(() => {
      newUser = new User(testUser)
    })

    it(`should return valid JWT`, () => {
      const token = newUser.generateJWT()
      expect(token).toEqual(expect.any(String))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded).toEqual(expect.objectContaining({
        _id: expect.any(String),
        username: newUser.username,
        validated: newUser.validated,
        iat: expect.any(Number),
        exp: expect.any(Number)
      }))
    })
  })
})
