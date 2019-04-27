'use strict'

const Post = require('../../../src/models/post')
const getPosts = require('../../../src/controllers/post/get-posts')

jest.mock('../../../src/models/post')

const postId = 'somePostObjectId'
const userId = 'someUserObjectId'

const posts = [
  {
    _id: postId,
    role: 'mentor',
    author: userId,
    active: true
  },
  {
    _id: 'postId2',
    role: 'mentee',
    author: userId,
    active: true
  },
  {
    _id: 'postId3',
    role: 'mentor',
    author: 'authorId2',
    active: false
  },
  {
    _id: 'postId4',
    role: 'mentee',
    author: 'authorId2',
    active: false
  }
]

describe('getPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call findPosts w/ default query and return array of posts', async () => {
    expect.assertions(3)

    Post.findPosts = jest.fn().mockResolvedValue(posts)

    const actual = await getPosts()
    expect(actual).toEqual(expect.any(Array))
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      filter: { active: true, deleted: false }
    })
  })

  it('should call findPosts w/ enhanced query and return array of posts', async () => {
    expect.assertions(3)
    const query = { id: postId }

    Post.findPosts = jest.fn().mockResolvedValue(posts)

    const actual = await getPosts({ query })
    expect(actual).toEqual(expect.any(Array))
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      filter: {
        _id: postId,
        active: true,
        deleted: false
      }
    })
  })

  it('should call findPosts w/o `active` query param when specified', async () => {
    expect.assertions(3)
    const query = { active: 'all' }

    Post.findPosts = jest.fn().mockResolvedValue(posts)

    const actual = await getPosts({ query })
    expect(actual).toEqual(expect.any(Array))
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      filter: {
        deleted: false
      }
    })
  })

  it('should call findPosts w/ other query params when specified', async () => {
    expect.assertions(3)
    const query = { author: userId }

    Post.findPosts = jest.fn().mockResolvedValue(posts)

    const actual = await getPosts({ query })
    expect(actual).toEqual(expect.any(Array))
    expect(Post.findPosts).toHaveBeenCalledTimes(1)
    expect(Post.findPosts).toHaveBeenCalledWith({
      filter: {
        active: true,
        deleted: false,
        author: userId
      }
    })
  })

  it('should handle errors thrown from DB calls', async () => {
    // mock Post model method error
    Post.findPosts = jest.fn().mockRejectedValue(new Error('Borked'))

    await expect(getPosts()).rejects
      .toThrow(/Borked/)
  })
})
