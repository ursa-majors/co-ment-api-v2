'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  getOneProfile,
  updateProfile,
  deleteProfile,
  getProfiles
} = require('../../src/controllers/profile')
const server = require('../../src/server')
const userId = 'foo'

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/profile', () => ({
  getOneProfile: jest.fn().mockResolvedValue(true),
  updateProfile: jest.fn().mockResolvedValue(true),
  deleteProfile: jest.fn().mockResolvedValue(true),
  getProfiles: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /profiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .get(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getOneProfile).toHaveBeenCalledTimes(1)
    expect(getOneProfile).toHaveBeenCalledWith({ userId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get(`/api/v2/profiles/${userId}`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)
    getOneProfile.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('PUT >> /profiles/:id', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .put(`/api/v2/profiles/${userId}`)
      .send({})
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(updateProfile).toHaveBeenCalledTimes(1)
    expect(updateProfile).toHaveBeenCalledWith({
      userId,
      token: expect.any(Object),
      body: expect.any(Object)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .put(`/api/v2/profiles/${userId}`)
      .send({})
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .put(`/api/v2/profiles/${userId}`)
      .send({})
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    updateProfile.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .put(`/api/v2/profiles/${userId}`)
      .send({})
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('DELETE >> /profiles/:id', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)

    const response = await request(server)
      .delete(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(deleteProfile).toHaveBeenCalledTimes(1)
    expect(deleteProfile).toHaveBeenCalledWith({
      token: expect.any(Object),
      userId
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .delete(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .delete(`/api/v2/profiles/${userId}`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)
    deleteProfile.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .delete(`/api/v2/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('GET >> /profilesd', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .get(`/api/v2/profiles`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getProfiles).toHaveBeenCalledTimes(1)
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get(`/api/v2/profiles`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get(`/api/v2/profiles`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .get(`/api/v2/profiles`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    getProfiles.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get(`/api/v2/profiles`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})
