'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const User = require('../../../src/models/user')
const updatePostLikes = require('../../../src/controllers/post/update-likes-count')

jest.mock('../../../src/models/post')
jest.mock('../../../src/models/user')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'
const postAuthor = 'someOtherUserObjectId'
const plusPlus = 'plusplus'
const minusMinus = 'minusminus'

const mockUser = {
  _id: userId,
  likedPosts: [],
  save: jest.fn()
}

const mockPost = {
  _id: postId,
  author: postAuthor,
  meta: { likes: 0 },
  save: jest.fn()
}

describe('updatePostLikes', () => {
  let post, user

  beforeEach(() => {
    jest.clearAllMocks()
    post = _cloneDeep(mockPost)
    user = _cloneDeep(mockUser)
    Post.findById = jest.fn(() => Post)
    User.findById = jest.fn(() => User)
  })

  it('should increment likes & return true on success', async () => {
    expect.assertions(5)
    const action = plusPlus

    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    const actual = await updatePostLikes({ postId, userId, action })
    expect(actual).toEqual({ updated: true })
    expect(user.likedPosts).toEqual([ postId ])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
  })

  it('should decrement likes & return true on success', async () => {
    expect.assertions(5)
    const action = minusMinus

    post.meta.likes = 1
    user.likedPosts = [ postId ]

    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    const actual = await updatePostLikes({ postId, userId, action })
    expect(actual).toEqual({ updated: true })
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(0)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
  })

  it('should do nothing & return false if user likes a post they already like', async () => {
    expect.assertions(5)
    const action = plusPlus

    post.meta.likes = 1
    user.likedPosts = [ postId ]

    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    const actual = await updatePostLikes({ postId, userId, action })
    expect(actual).toEqual({ updated: false })
    expect(user.likedPosts).toEqual([ postId ])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
  })

  it('should do nothing & return false if user unlikes a post they do not already like', async () => {
    expect.assertions(5)
    const action = minusMinus

    post.meta.likes = 1
    user.likedPosts = []

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    const actual = await updatePostLikes({ postId, userId, action })
    expect(actual).toEqual({ updated: false })
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
  })

  it('should do nothing & return false if user likes their own post', async () => {
    expect.assertions(5)
    const action = plusPlus

    post.author = userId

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    const actual = await updatePostLikes({ postId, userId, action })
    expect(actual).toEqual({ updated: false })
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(0)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
  })

  it('should throw with 400 status when missing postId', async () => {
    expect.assertions(3)
    const action = minusMinus

    User.exec = jest.fn()
    Post.exec = jest.fn()

    await expect(updatePostLikes({ userId, action })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required postId'
      }))
    expect(User.exec).not.toHaveBeenCalled()
    expect(Post.exec).not.toHaveBeenCalled()
  })

  it('should throw with 400 status when missing userId', async () => {
    expect.assertions(3)
    const action = minusMinus

    User.exec = jest.fn()
    Post.exec = jest.fn()

    await expect(updatePostLikes({ postId, action })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId'
      }))
    expect(User.exec).not.toHaveBeenCalled()
    expect(Post.exec).not.toHaveBeenCalled()
  })

  it('should throw with 400 status when missing action', async () => {
    expect.assertions(3)

    User.exec = jest.fn()
    Post.exec = jest.fn()

    await expect(updatePostLikes({ postId, userId })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required action'
      }))
    expect(User.exec).not.toHaveBeenCalled()
    expect(Post.exec).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from Post DB method calls', async () => {
    expect.assertions(3)
    const action = minusMinus

    // mock Post model method rejection
    User.exec = jest.fn().mockResolvedValue(mockUser)
    Post.exec = jest.fn().mockRejectedValue(new Error('Post Borked'))

    await expect(updatePostLikes({ postId, userId, action })).rejects
      .toThrow(/Post Borked/)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
  })

  it('should handle errors thrown from User DB method calls', async () => {
    expect.assertions(3)
    const action = minusMinus

    // mock Post model method rejection
    User.exec = jest.fn().mockRejectedValue(new Error('User Borked'))
    Post.exec = jest.fn().mockResolvedValue(mockUser)

    await expect(updatePostLikes({ postId, userId, action })).rejects
      .toThrow(/User Borked/)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
  })
})
