'use strict'

const User = require('../../../models/user')
const Post = require('../../../models/post')
const deleteProfile = require('../../../controllers/profile/delete-profile')

jest.mock('../../../models/user')
jest.mock('../../../models/post')

const log = {}
const req = {
  params: {},
  token: {},
  log
}
const res = {
  status: jest.fn(function () { return this }),
  json: jest.fn()
}
const next = jest.fn()

describe('deleteProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 & deleted profile on success', async () => {
    expect.assertions(8)
    const userId = '123'
    const name = 'Leroy'
    req.params.id = userId
    req.token._id = userId
    req.token.username = name
    User.deleteUser = jest.fn().mockResolvedValue(expect.any(Object))
    Post.deletePostsByAuthor = jest.fn().mockResolvedValue(true)

    await deleteProfile(req, res, next)
    expect(User.deleteUser).toHaveBeenCalledTimes(1)
    expect(User.deleteUser).toHaveBeenCalledWith(expect.objectContaining({
      _id: userId,
      username: name
    }))
    expect(Post.deletePostsByAuthor).toHaveBeenCalledTimes(1)
    expect(Post.deletePostsByAuthor).toHaveBeenCalledWith(expect.objectContaining({
      authorId: userId
    }))
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should call next with 404 error if no profile deleted', async () => {
    expect.assertions(7)
    const userId = '123'
    const name = 'Leroy'
    req.params.id = userId
    req.token._id = userId
    req.token.username = name
    User.deleteUser = jest.fn().mockResolvedValue(undefined)
    Post.deletePostsByAuthor = jest.fn().mockResolvedValue(true)

    await deleteProfile(req, res, next)
    expect(User.deleteUser).toHaveBeenCalledTimes(1)
    expect(User.deleteUser).toHaveBeenCalledWith(expect.objectContaining({
      _id: userId,
      username: name
    }))
    expect(Post.deletePostsByAuthor).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: 'Delete error: user not found'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should call next with 404 error if no profile deleted', async () => {
    expect.assertions(8)
    const userId = '123'
    const name = 'Leroy'
    req.params.id = userId
    req.token._id = userId
    req.token.username = name
    User.deleteUser = jest.fn().mockResolvedValue(expect.any(Object))
    Post.deletePostsByAuthor = jest.fn().mockResolvedValue(false)

    await deleteProfile(req, res, next)
    expect(User.deleteUser).toHaveBeenCalledTimes(1)
    expect(User.deleteUser).toHaveBeenCalledWith(expect.objectContaining({
      _id: userId,
      username: name
    }))
    expect(Post.deletePostsByAuthor).toHaveBeenCalledTimes(1)
    expect(Post.deletePostsByAuthor).toHaveBeenCalledWith(expect.objectContaining({
      authorId: userId
    }))
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 500,
      message: 'Failed to delete posts'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    expect.assertions(4)
    User.deleteUser = jest.fn().mockRejectedValue(new Error('boom'))
    await deleteProfile(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'boom'
    }))
  })
})
