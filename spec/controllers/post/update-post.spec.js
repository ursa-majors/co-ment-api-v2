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
  })

  it('should return updated post on success', async () => {
    expect.assertions(3)
    const body = { title: 'Updated Title' }

    Post.updatePost = jest.fn().mockResolvedValue(post)

    const actual = await updatePost({ postId, userId, body })
    expect(actual).toEqual({
      message: 'Post updated',
      post: expect.any(Object)
    })
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
    expect(Post.updatePost).toHaveBeenCalledWith({
      target: { _id: postId, author: userId },
      updates: { ...body, updatedAt: expect.any(String) },
      options: { new: true }
    })
  })

  it('should throw with 404 status if cannot find post to update', async () => {
    expect.assertions(3)
    const body = { title: 'Updated Title' }

    Post.updatePost = jest.fn().mockResolvedValue(null)

    await expect(updatePost({ postId, userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: expect.stringContaining('Post not found')
      }))
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
    expect(Post.updatePost).toHaveBeenCalledWith({
      target: { _id: postId, author: userId },
      updates: { ...body, updatedAt: expect.any(String) },
      options: { new: true }
    })
  })

  it('should handle errors thrown from Post DB method calls', async () => {
    expect.assertions(2)
    const body = { title: 'Updated Title' }

    Post.updatePost = jest.fn().mockRejectedValue(new Error('Post Borked'))

    await expect(updatePost({ postId, userId, body })).rejects
      .toThrow(/Post Borked/)
    expect(Post.updatePost).toHaveBeenCalledTimes(1)
  })
})
