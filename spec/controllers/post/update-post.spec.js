'use strict'

const Post = require('../../../src/models/post')
const updatePost = require('../../../src/controllers/post/update-post')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

const populatedPost = {
  _id: postId,
  author: userId,
  action: '',
  role: '',
  title: '',
  body: '',
  excerpt: '',
  keywords: [],
  availability: '',
  meta: { likes: 0 },
  username: '',
  name: '',
  avatarUrl: '',
  time_zone: '',
  languages: [],
  gender: ''
}

const post = {
  _id: postId,
  author: userId,
  action: '',
  role: '',
  title: '',
  body: '',
  excerpt: '',
  keywords: [],
  availability: '',
  meta: { likes: 0 },
  populate: jest.fn().mockResolvedValue(populatedPost)
}

describe('updatePost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Post.findOneAndUpdate = jest.fn(() => Post)
  })

  it('should return updated post on success', async () => {
    expect.assertions(3)
    const body = { title: 'Updated Title' }

    Post.exec = jest.fn().mockResolvedValue(post)

    const actual = await updatePost({ postId, userId, body })
    expect(actual).toEqual({
      message: 'Post updated',
      post: expect.any(Object)
    })
    expect(Post.findOneAndUpdate).toHaveBeenCalledTimes(1)
    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: postId, author: userId },
      { ...body, updatedAt: expect.any(String) },
      { new: true }
    )
  })

  it('should throw with 404 status if cannot find post to update', async () => {
    expect.assertions(3)
    const body = { title: 'Updated Title' }

    Post.exec = jest.fn().mockResolvedValue(null)

    await expect(updatePost({ postId, userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: expect.stringContaining('Post not found')
      }))
    expect(Post.findOneAndUpdate).toHaveBeenCalledTimes(1)
    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: postId, author: userId },
      { ...body, updatedAt: expect.any(String) },
      { new: true }
    )
  })

  it('should throw with 400 status when missing postId', async () => {
    expect.assertions(1)
    const body = { title: 'Updated Title' }

    await expect(updatePost({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required postId'
      }))
  })

  it('should throw with 400 status when missing userId', async () => {
    expect.assertions(1)
    const body = { title: 'Updated Title' }

    await expect(updatePost({ postId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId'
      }))
  })

  it('should throw with 400 status when missing body', async () => {
    expect.assertions(1)

    await expect(updatePost({ postId, userId })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required body'
      }))
  })

  it('should handle errors thrown from Post DB method calls', async () => {
    expect.assertions(2)
    const body = { title: 'Updated Title' }

    Post.exec = jest.fn().mockRejectedValue(new Error('Post Borked'))

    await expect(updatePost({ postId, userId, body })).rejects
      .toThrow(/Post Borked/)
    expect(Post.findOneAndUpdate).toHaveBeenCalledTimes(1)
  })
})
