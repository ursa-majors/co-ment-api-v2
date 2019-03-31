'use strict'

const Post = require('../../../src/models/post')
const createPost = require('../../../src/controllers/post/create-post')

jest.mock('../../../src/models/post')
Post.prototype.save = jest.fn()
Post.prototype.populate = jest.fn().mockResolvedValue({})

const id = 'someMongodbObjectId'
const title = 'New Post Title'
const role = 'New Post Role'

describe('createPost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Post.findOne = jest.fn(() => Post)
  })

  it('should respond with 200 & new post object on success', async () => {
    expect.assertions(5)
    const userId = id
    const body = { title, role }

    // undefined means post doesn't already exist
    Post.exec = jest.fn().mockResolvedValue(undefined)

    const actual = await createPost({ userId, body })
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(Post.prototype.save).toHaveBeenCalledTimes(1)
    expect(Post.prototype.populate).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(expect.objectContaining({
      message: expect.stringContaining('New post saved'),
      post: expect.any(Object)
    }))
  })

  it('should throw with 400 status if post already exists', async () => {
    expect.assertions(5)
    const userId = id
    const body = { title, role }

    // mock Post model result
    Post.exec = jest.fn().mockResolvedValue({ title, role })

    await expect(createPost({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('post already exists')
      }))
    expect(Post.findOne).toHaveBeenCalledTimes(1)
    expect(Post.exec).toHaveBeenCalledTimes(1)
    expect(Post.prototype.save).not.toHaveBeenCalled()
    expect(Post.prototype.populate).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(2)
    const userId = id
    const body = { title, role }

    // mock Post model method rejection
    Post.exec = jest.fn().mockRejectedValue(new Error('Borked'))

    await expect(createPost({ userId, body })).rejects
      .toThrow(/Borked/)
    expect(Post.findOne).toHaveBeenCalledTimes(1)
  })
})
