const authMiddleware = require('../auth.middleware')
const ApiError = require('../../exceptions/api-error')
const tokenService = require('../../service/token.service')

jest.mock('../../service/token.service')

const mockUserData = {
  email: 'test@test.test',
  id: '99',
  role: 'customer',
  iat: 1645023615,
  exp: 1650207615,
}

describe('Authorization middleware', () => {
  let mockRequest
  let mockResponse
  let nextFunction = jest.fn()

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: jest.fn(),
    }
  })

  test('Without authorization header', () => {
    mockRequest.headers = {}
    authMiddleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction).toBeCalledWith(ApiError.UnauthorizedError())
  })

  test('Wrong auth header', () => {
    mockRequest.headers = { authorization: 'BearerX' }
    authMiddleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction).toBeCalledWith(ApiError.UnauthorizedError())
  })

  test('Correct user data in authorization header', () => {
    tokenService.validateAccessToken.mockReturnValue(mockUserData)
    mockRequest.headers = { authorization: 'Bearer token' }
    authMiddleware(mockRequest, mockResponse, nextFunction)
    expect(mockRequest).toEqual({
      headers: { authorization: 'Bearer token' },
      user: mockUserData,
    })
    expect(nextFunction).toHaveBeenCalledTimes(1)
  })

  test('Failed validation token', () => {
    tokenService.validateAccessToken.mockReturnValue(null)
    mockRequest.headers = { authorization: 'Bearer token' }

    authMiddleware(mockRequest, mockResponse, nextFunction)
    expect(nextFunction).toBeCalledWith(ApiError.UnauthorizedError())
  })
})
