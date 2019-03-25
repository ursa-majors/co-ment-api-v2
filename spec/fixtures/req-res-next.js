/**
 * mocked request route parameters
 */

const req = {
  body: {},
  params: {},
  query: {},
  token: {},
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}

const res = {
  status: jest.fn(function () { return this }),
  json: jest.fn()
}

const next = jest.fn()

exports = module.exports = { req, res, next }
