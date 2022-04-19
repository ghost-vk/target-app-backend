const HealthCheckController = require('../health-check.controller')
const { query } = require('../../db')
const ApiError = require('../../exceptions/api-error')

jest.mock('../../db', () => ({
  query: jest.fn()
}))

describe('Health check controller', () => {
  let mockRequest
  let mockResponse
  let nextFunction = jest.fn()

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn(() => ({
        send: () => {},
      })),
    }
  })

  test.only('Have connection to database.', async () => {
    query.mockImplementation(async () => ({ rows: [{ id: 1 }] }))

    await HealthCheckController.isApiHealthy(
      mockRequest,
      mockResponse,
      nextFunction
    )

    expect(mockResponse.status).toBeCalledWith(204)
  })

  test('No database connection.', async () => {
    query.mockImplementation(async () => {
      throw new Error('Something going wrong')
    })

    await HealthCheckController.isApiHealthy(
      mockRequest,
      mockResponse,
      nextFunction
    )

    expect(nextFunction).toBeCalledWith(
      new ApiError(500, 'Error when connect to database. Try to read value.')
    )
  })

  test('Forbidden to insert.', async () => {
    query.mockImplementation(async (request) => {
      if (/INSERT/gm.test(request)) {
        throw new Error('Forbidden.')
      }
      return { rows: [{ id: 1 }] }
    })

    await HealthCheckController.isApiHealthy(
      mockRequest,
      mockResponse,
      nextFunction
    )

    expect(nextFunction).toBeCalledWith(
      new ApiError(500, 'Error when connect to database. Try to insert value.')
    )
  })
})
