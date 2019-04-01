'use strict'

const redirectHash = require('../../../src/controllers/static/redirect-hash')

const req = {
  params: {}
}

const res = {
  redirect: jest.fn()
}

describe('redirectHash', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call redirect with two correct params', () => {
    req.params = { client_route: 'viewpost', uid: 'bc37599dd92b8a2007161fc3' }

    redirectHash(req, res)
    expect(res.redirect).toHaveBeenCalledTimes(1)
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/#/redirect=viewpost/bc37599dd92b8a2007161fc3'
    )
  })

  it('should call redirect with single param', () => {
    req.params = { client_route: 'profiles' }

    redirectHash(req, res)
    expect(res.redirect).toHaveBeenCalledTimes(1)
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/#/redirect=profiles'
    )
  })
})
