'use strict'

const User = require('../../../src/models/user')
const mailer = require('../../../src/utils/mailer')
const resendValidation = require('../../../src/controllers/contact/resend-validation')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

const userId = '87asdkhj298asdklhj'
const key = '87asdkhj298asdklhj'
const mockUser = {
  _id: userId,
  email: 'test@example.com',
  signupKey: { key }
}

describe('resendValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findOneAndUpdate = jest.fn(() => User)
  })

  it('should call mailer and return success message on success', async () => {
    expect.assertions(3)
    User.exec = jest.fn().mockResolvedValue(mockUser)
    const actual = await resendValidation({ userId })
    expect(actual).toEqual({ message: expect.any(String) })
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledWith(
      mockUser.email, // recipient
      expect.any(String), // subject
      expect.objectContaining({ // body
        type: 'html',
        text: expect.any(String)
      })
    )
  })

  it('should throw with 404 status if user not found to update', async () => {
    expect.assertions(2)
    User.exec = jest.fn().mockResolvedValue(null)
    await expect(resendValidation({ userId })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'User not found'
      }))
    expect(mailer).not.toHaveBeenCalled()
  })
})
