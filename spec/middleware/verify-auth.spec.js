'use strict'

const jwt = require('jsonwebtoken')
const req = {
  headers: {}
}
const res = {}

describe('verifyAuth middleware', () => {
  it('should validate jwt and set req.token', (done) => {
    const secret = 'shhhhhh'
    process.env.JWT_SECRET = secret
    const token = jwt.sign({ _id: 'foo', name: 'bar' }, secret)

    const verifyAuth = require('../../src/middleware/verify-auth')
    req.headers = {
      authorization: `Bearer ${token}`
    }

    verifyAuth(req, res, function next () {
      expect(req.token).toEqual({
        _id: 'foo',
        name: 'bar',
        iat: expect.any(Number)
      })
      done()
    })
  })
})
