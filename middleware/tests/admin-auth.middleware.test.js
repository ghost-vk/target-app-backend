const adminAuthMiddleware = require('../admin-auth.middleware')
const ApiError = require('../../exceptions/api-error')

describe('Admin authorization middleware', () => {
  let mockRequest
  let mockResponse
  let nextFunction

  beforeEach(() => {
    mockRequest = {
      user: {}
    }
    mockResponse = {}
    nextFunction = jest.fn()
  })

  test('Correct value, user has admin role', () => {
    mockRequest.user.role = 'admin'
    adminAuthMiddleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction).not.toBeCalledWith(ApiError.UnauthorizedAdminError())
    expect(nextFunction).toBeCalledTimes(1)
  })

  test('User is not admin', () => {
    mockRequest.user.role = 'goblin'
    adminAuthMiddleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction).toBeCalledWith(ApiError.UnauthorizedAdminError())
  })

  test('No user in request', () => {
    adminAuthMiddleware({}, mockResponse, nextFunction)
    expect(nextFunction).toBeCalledWith(ApiError.UnauthorizedAdminError())
  })
})
