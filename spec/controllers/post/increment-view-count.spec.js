'use strict'

const Post = require('../../../src/models/post')
const incrementViews = require('../../../src/controllers/post/increment-view-count')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

describe('incrementViews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return success message on success', async () => {
    expect.assertions(3)

    Post.incrementViews = jest.fn().mockResolvedValue({})

    const actual = await incrementViews({ postId, userId })
    expect(actual).toEqual({ message: 'Post updated' })
    expect(Post.incrementViews).toHaveBeenCalledTimes(1)
    expect(Post.incrementViews).toHaveBeenCalledWith({ postId, userId })
  })

  it('should return unsuccess message on no update', async () => {
    expect.assertions(3)

    Post.incrementViews = jest.fn().mockResolvedValue(null)

    const actual = await incrementViews({ postId, userId })
    expect(actual).toEqual({ message: 'Post not updated' })
    expect(Post.incrementViews).toHaveBeenCalledTimes(1)
    expect(Post.incrementViews).toHaveBeenCalledWith({ postId, userId })
  })

  it('should handle errors thrown from DB calls', async () => {
    expect.assertions(2)

    // mock Post model method rejection
    Post.incrementViews = jest.fn().mockRejectedValue(new Error('Borked'))

    await expect(incrementViews({ postId, userId })).rejects
      .toThrow(/Borked/)
    expect(Post.incrementViews).toHaveBeenCalledTimes(1)
  })

  it(`should throw with 400 status if missing 'postId' param`, async () => {
    await expect(incrementViews({ userId })).rejects
      .toThrow(/Missing required postId/)
  })

  it(`should throw with 400 status if missing 'userId' param`, async () => {
    await expect(incrementViews({ postId })).rejects
      .toThrow(/Missing required userId/)
  })
})
