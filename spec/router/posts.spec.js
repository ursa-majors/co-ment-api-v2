'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  getPosts,
  incrementViews,
  createPost,
  updatePost,
  updateLikes,
  deletePost
} = require('../../src/controllers/post')
const server = require('../../src/server')
const userId = 'foo'

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/post', () => ({
  getPosts: jest.fn().mockResolvedValue(true),
  incrementViews: jest.fn().mockResolvedValue(true),
  createPost: jest.fn().mockResolvedValue(true),
  updatePost: jest.fn().mockResolvedValue(true),
  updateLikes: jest.fn().mockResolvedValue(true),
  deletePost: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)

    const response = await request(server)
      .get('/api/v2/posts')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getPosts).toHaveBeenCalledTimes(1)
    expect(getPosts).toHaveBeenCalledWith({ query: expect.any(Object) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/posts')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/posts')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)
    getPosts.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/posts')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('PUT >> /posts/:id/viewsplusplus', () => {
  it('should respond with 200 status on success', async () => {
    const postId = 'abcd123'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .put(`/api/v2/posts/${postId}/viewsplusplus`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(incrementViews).toHaveBeenCalledTimes(1)
    expect(incrementViews).toHaveBeenCalledWith({
      postId: expect.any(String),
      userId: expect.any(String)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const postId = 'abcd123'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}/viewsplusplus`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const postId = 'abcd123'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}/viewsplusplus`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const postId = 'abcd123'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    incrementViews.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .put(`/api/v2/posts/${postId}/viewsplusplus`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('POST >> /conversations', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .post('/api/v2/posts')
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(createPost).toHaveBeenCalledTimes(1)
    expect(createPost).toHaveBeenCalledWith({
      userId: expect.any(String),
      body: expect.any(Object)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .post('/api/v2/posts')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .post('/api/v2/posts')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .post('/api/v2/posts')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    createPost.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .post('/api/v2/posts')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('PUT >> /posts/:id', () => {
  it('should respond with 200 status on success', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .put(`/api/v2/posts/${postId}`)
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(updatePost).toHaveBeenCalledTimes(1)
    expect(updatePost).toHaveBeenCalledWith({
      postId,
      userId,
      body: expect.any(Object)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}`)
      .send({ body: {} })
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}`)
      .send({ body: {} })
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .put(`/api/v2/posts/${postId}`)
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    updatePost.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .put(`/api/v2/posts/${postId}`)
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('PUT >> /posts/:id/likes', () => {
  it('should respond with 200 status on success', async () => {
    const action = 'plusplus'
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .put(`/api/v2/posts/${postId}/likes?action=${action}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(updateLikes).toHaveBeenCalledTimes(1)
    expect(updateLikes).toHaveBeenCalledWith({ postId, userId, action })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}/likes`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .put(`/api/v2/posts/${postId}/likes`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .put(`/api/v2/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    updateLikes.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .put(`/api/v2/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('DELETE >> /posts/:id', () => {
  it('should respond with 200 status on success', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .delete(`/api/v2/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(deletePost).toHaveBeenCalledTimes(1)
    expect(deletePost).toHaveBeenCalledWith({ postId, userId })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .delete(`/api/v2/posts/${postId}`)
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const postId = 'abc1234'
    const response = await request(server)
      .delete(`/api/v2/posts/${postId}`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .delete(`/api/v2/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const postId = 'abc1234'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    deletePost.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .delete(`/api/v2/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})
