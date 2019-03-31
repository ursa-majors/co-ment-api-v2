'use strict'

const Post = require('../../../src/models/post')
const deletePost = require('../../../src/controllers/post/delete-post')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

describe('deletePost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 & deleted JSON on success', async () => {
    expect.assertions(3)

    // mock Post model instance & static methods
    const populate = jest.fn().mockResolvedValue({})
    Post.deletePost = jest.fn().mockResolvedValue({ populate })

    const actual = await deletePost({ postId, userId })
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
    expect(populate).toHaveBeenCalledTimes(1)
    expect(actual).toEqual({
      message: expect.stringContaining('Post deleted'),
      post: expect.any(Object)
    })
  })

  it('should throw with 404 status if post not found', async () => {
    expect.assertions(2)

    // mock Post model instance & static methods
    Post.deletePost = jest.fn().mockResolvedValue(undefined)

    await expect(deletePost({ postId, userId })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: expect.stringContaining('Post not found')
      }))
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
  })

  it('should throw with 400 status is missing postId', async () => {
    expect.assertions(3)

    const populate = jest.fn().mockResolvedValue({})
    Post.deletePost = jest.fn().mockResolvedValue({ populate })

    await expect(deletePost({ userId })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Missing required postId')
      }))
    expect(Post.deletePost).not.toHaveBeenCalled()
    expect(populate).not.toHaveBeenCalled()
  })

  it('should throw with 400 status is missing userId', async () => {
    expect.assertions(3)

    const populate = jest.fn().mockResolvedValue({})
    Post.deletePost = jest.fn().mockResolvedValue({ populate })

    await expect(deletePost({ postId })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Missing required userId')
      }))
    expect(Post.deletePost).not.toHaveBeenCalled()
    expect(populate).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(2)

    // mock Post model method rejection
    Post.deletePost = jest.fn().mockRejectedValue(new Error('Borked'))

    await expect(deletePost({ postId, userId })).rejects
      .toThrow(/Borked/)
    expect(Post.deletePost).toHaveBeenCalledTimes(1)
  })
})
