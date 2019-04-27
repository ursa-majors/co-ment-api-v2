'use strict'

const User = require('../../../src/models/user')
const Post = require('../../../src/models/post')
const deleteProfile = require('../../../src/controllers/profile/delete-profile')

jest.mock('../../../src/models/user')
jest.mock('../../../src/models/post')

describe('deleteProfile', () => {
  beforeAll(() => {
    User.findOneAndRemove = jest.fn(() => User)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return deleted user profile on success', async () => {
    expect.assertions(5)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    User.exec = jest.fn().mockResolvedValue(expect.any(Object))
    Post.deletePostsByAuthor = jest.fn().mockResolvedValue(true)

    const actual = await deleteProfile({ userId, token })
    expect(User.findOneAndRemove).toHaveBeenCalledTimes(1)
    expect(User.findOneAndRemove).toHaveBeenCalledWith({
      _id: userId,
      username: name
    })
    expect(Post.deletePostsByAuthor).toHaveBeenCalledTimes(1)
    expect(Post.deletePostsByAuthor).toHaveBeenCalledWith(expect.objectContaining({
      authorId: userId
    }))
    expect(actual).toEqual(expect.any(Object))
  })

  it('should throw with 403 status if trying to delete another users post', async () => {
    expect.assertions(3)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: 'not123', username: name }
    User.exec = jest.fn()
    Post.deletePostsByAuthor = jest.fn()

    await expect(deleteProfile({ userId, token })).rejects
      .toThrow(expect.objectContaining({
        status: 403,
        message: 'Delete profile not permitted'
      }))
    expect(User.findOneAndRemove).not.toHaveBeenCalled()
    expect(Post.deletePostsByAuthor).not.toHaveBeenCalled()
  })

  it('should throw with 404 status if no profile found', async () => {
    expect.assertions(4)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    User.exec = jest.fn().mockResolvedValue(undefined)
    Post.deletePostsByAuthor = jest.fn()

    await expect(deleteProfile({ userId, token })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'Delete error: user not found'
      }))
    expect(User.findOneAndRemove).toHaveBeenCalledTimes(1)
    expect(User.findOneAndRemove).toHaveBeenCalledWith({
      _id: userId,
      username: name
    })
    expect(Post.deletePostsByAuthor).not.toHaveBeenCalled()
  })

  it('should throw with 500 status if posts are not deleted', async () => {
    expect.assertions(5)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    User.exec = jest.fn().mockResolvedValue(expect.any(Object))
    Post.deletePostsByAuthor = jest.fn().mockResolvedValue(false)

    await expect(deleteProfile({ userId, token })).rejects
      .toThrow(expect.objectContaining({
        status: 500,
        message: 'Failed to delete posts'
      }))
    expect(User.findOneAndRemove).toHaveBeenCalledTimes(1)
    expect(User.findOneAndRemove).toHaveBeenCalledWith({
      _id: userId,
      username: name
    })
    expect(Post.deletePostsByAuthor).toHaveBeenCalledTimes(1)
    expect(Post.deletePostsByAuthor).toHaveBeenCalledWith(expect.objectContaining({
      authorId: userId
    }))
  })

  it('should handle database errors', async () => {
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    User.exec = jest.fn().mockRejectedValue(new Error('boom'))
    await expect(deleteProfile({ userId, token })).rejects
      .toThrow(/boom/)
  })
})
