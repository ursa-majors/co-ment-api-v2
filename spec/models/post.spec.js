const _cloneDeep = require('lodash/cloneDeep')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Post = require('../../src/models/post')

const mockPost = {
  author: ObjectId('111f111e111c11111de860ea'),
  availability: 'mock availability',
  body: 'mock body',
  excerpt: 'mock excerpt',
  keywords: ['mock', 'keywords'],
  title: 'mock title',
  meta: {
    views: 0,
    likes: 0
  }
}

describe(`Post model`, () => {
  let post

  beforeEach(() => {
    post = _cloneDeep(mockPost)
  })

  it(`should validate 'author' type`, async () => {
    post.author = 'wrong type'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: author/)
  })

  it(`should validate 'availability' type`, async () => {
    post.availability = { wrong: 'type' }
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: availability/)
  })

  it(`should validate 'body' existence`, async () => {
    delete post.body
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed.*body.*required/)
  })

  it(`should validate 'body' type`, async () => {
    post.body = { wrong: 'type' }
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: body/)
  })

  it(`should validate 'excerpt' type`, async () => {
    post.excerpt = { wrong: 'type' }
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: excerpt/)
  })

  it(`should validate 'keywords' type`, async () => {
    post.keywords = { wrong: 'type' }
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: keywords/)
  })

  it(`should validate 'role' enum`, async () => {
    post.role = 'wrong enum'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: role/)
  })

  it(`should validate 'title' existence`, async () => {
    delete post.title
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed.*title.*required/)
  })

  it(`should validate 'title' type`, async () => {
    post.title = { wrong: 'type' }
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: title/)
  })

  it(`should validate 'deleted' type`, async () => {
    post.deleted = 'supposed to be a boolean'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: deleted/)
  })

  it(`should validate 'meta.views' type`, async () => {
    post.meta.views = 'supposed to be a number'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: meta.views/)
  })

  it(`should validate 'meta.likes' type`, async () => {
    post.meta.likes = 'supposed to be a number'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: meta.likes/)
  })

  it(`should validate 'updatedAt' type`, async () => {
    post.updatedAt = 'supposed to be a date'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: updatedAt/)
  })

  it(`should validate 'createdAt' type`, async () => {
    post.createdAt = 'supposed to be a date'
    const p = new Post(post)
    await expect(p.validate()).rejects
      .toThrow(/Post validation failed: createdAt/)
  })
})

describe(`Post model static methods`, () => {
  beforeAll(() => {
    Post.update = jest.fn(() => Post)
    Post.populate = jest.fn(() => Post)
    Post.find = jest.fn(() => Post)
    Post.findOneAndUpdate = jest.fn(() => Post)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`.findPosts()`, () => {
    it(`should return an array of posts with author info`, async () => {
      Post.exec = jest.fn().mockResolvedValue([new Post(mockPost)])
      const filter = { active: true, deleted: false }
      const actual = await Post.findPosts({ filter })
      expect(actual).toEqual(expect.any(Array))
      expect(Post.find).toHaveBeenCalledTimes(1)
      expect(Post.find).toHaveBeenCalledWith(filter)
      expect(Post.populate).toHaveBeenCalledTimes(1)
    })
  })

  describe(`.deletePost()`, () => {
    it(`should return a post after updating its views`, async () => {
      Post.exec = jest.fn().mockResolvedValue(new Post(mockPost))
      const postId = '111f111e111c11111de860ea'
      const userId = '222f222e222c22222de860ea'
      const actual = await Post.incrementViews({ postId, userId })
      expect(actual).toEqual(expect.any(Object))
      expect(Post.findOneAndUpdate).toHaveBeenCalledTimes(1)
      expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: postId, author: { $ne: userId } },
        { $inc: { 'meta.views': 1 } },
        { new: true }
      )
    })
  })

  describe(`.deletePost()`, () => {
    it(`should return a post after "deleting" it`, async () => {
      Post.exec = jest.fn().mockResolvedValue(new Post(mockPost))
      const postId = '111f111e111c11111de860ea'
      const userId = '222f222e222c22222de860ea'
      const actual = await Post.deletePost({ postId, userId })
      expect(actual).toEqual(expect.any(Object))
      expect(Post.findOneAndUpdate).toHaveBeenCalledTimes(1)
      expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: postId, author: userId },
        { deleted: true, active: false, updatedAt: expect.any(String) },
        { new: true }
      )
    })
  })

  describe(`.deletePostsByAuthor()`, () => {
    it(`should return array of posts after "deleting" them`, async () => {
      Post.exec = jest.fn().mockResolvedValue({ nModified: 1 })
      const authorId = '222f222e222c22222de860ea'
      const actual = await Post.deletePostsByAuthor(authorId)
      expect(actual).toEqual(true)
      expect(Post.update).toHaveBeenCalledTimes(1)
      expect(Post.update).toHaveBeenCalledWith(
        { author_id: authorId },
        { deleted: true, active: false, updatedAt: expect.any(String) },
        { multi: true }
      )
    })
  })
})
