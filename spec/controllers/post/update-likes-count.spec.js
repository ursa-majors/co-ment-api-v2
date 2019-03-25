'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const Post = require('../../../src/models/post')
const User = require('../../../src/models/user')
const reqResNext = require('../../fixtures/req-res-next')
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
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    res.end = jest.fn()
    next = reqResNext.next
    Post.findById = jest.fn(() => Post)
    User.findById = jest.fn(() => User)
  })

  it('should increment likes & respond with 200 status on success', async () => {
    expect.assertions(7)
    req.token._id = userId
    req.params.id = postId
    req.query.action = plusPlus

    const post = _cloneDeep(mockPost)
    const user = _cloneDeep(mockUser)

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    await updatePostLikes(req, res, next)
    expect(user.likedPosts).toEqual([ postId ])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should decrement likes & respond with 200 status on success', async () => {
    expect.assertions(7)
    req.token._id = userId
    req.params.id = postId
    req.query.action = minusMinus

    const post = _cloneDeep(mockPost)
    const user = _cloneDeep(mockUser)
    post.meta.likes = 1
    user.likedPosts = [ postId ]

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    await updatePostLikes(req, res, next)
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(0)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should do nothing if user likes a post they already like', async () => {
    expect.assertions(7)
    req.token._id = userId
    req.params.id = postId
    req.query.action = plusPlus

    const post = _cloneDeep(mockPost)
    const user = _cloneDeep(mockUser)
    post.meta.likes = 1
    user.likedPosts = [ postId ]

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    await updatePostLikes(req, res, next)
    expect(user.likedPosts).toEqual([ postId ])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should do nothing if user unlikes a post they do not already like', async () => {
    expect.assertions(7)
    req.token._id = userId
    req.params.id = postId
    req.query.action = minusMinus

    const post = _cloneDeep(mockPost)
    const user = _cloneDeep(mockUser)
    post.meta.likes = 1
    user.likedPosts = []

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    await updatePostLikes(req, res, next)
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(1)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should do nothing if user likes their own post', async () => {
    expect.assertions(7)
    req.token._id = userId
    req.params.id = postId
    req.query.action = minusMinus

    const post = _cloneDeep(mockPost)
    const user = _cloneDeep(mockUser)
    post.author = mockUser

    // mock model static methods
    Post.exec = jest.fn().mockResolvedValue(post)
    User.exec = jest.fn().mockResolvedValue(user)

    await updatePostLikes(req, res, next)
    expect(user.likedPosts).toEqual([])
    expect(post.meta.likes).toEqual(0)
    expect(Post.findById).toHaveBeenCalledTimes(1)
    expect(User.findById).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from Post DB method calls', async () => {
    expect.assertions(6)
    req.token._id = userId
    req.params.id = postId
    req.query.action = minusMinus

    // mock Post model method rejection
    User.exec = jest.fn().mockResolvedValue(mockUser)
    Post.exec = jest.fn().mockRejectedValue(new Error('Post Borked'))

    await updatePostLikes(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Post Borked')
    }))
  })

  it('should handle errors thrown from User DB method calls', async () => {
    expect.assertions(6)
    req.token._id = userId
    req.params.id = postId
    req.query.action = minusMinus

    // mock Post model method rejection
    User.exec = jest.fn().mockRejectedValue(new Error('User Borked'))
    Post.exec = jest.fn().mockResolvedValue(mockUser)

    await updatePostLikes(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('User Borked')
    }))
  })
})
