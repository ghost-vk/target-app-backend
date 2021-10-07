// const bcrypt = require('bcrypt')
// const getPass = async () => {
//   // const salt = await bcrypt.genSalt(10)
//   // console.log(salt)
//   const hashPass = await bcrypt.hash('Dkflbr100499', '$2b$10$ehoSzUj5ui9aVN0uy92SR.')
//   console.log(hashPass)
// }
// getPass()
require('dotenv').config()
const db = require('./db')
const userDto = require('./dtos/user.dto')
const userService = require('./service/user.service')
const tokenService = require('./service/token.service')
async function setAdmin() {
  try {
    const user = userService.getUserById(1)
    const preparedForClientUser = new userDto(user)
    const tokens = tokenService.generateTokens({ ...preparedForClientUser })
    console.log(tokens)
    /**
     * Ouput:
     * {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzI4MjI5ODcsImV4cCI6MTYzMjgyNDc4N30.CzHNeIDPoKfvUsahLLL6pwDcy6EM-uGzKXu5x9D-JpA',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzI4MjI5ODcsImV4cCI6MTYzNTQxNDk4N30.d6TpDimMR_4qdvxKE9KEO2qpHWiwJ87Fwf5ikgSpc9c'
}
     */
  } catch (e) {
    console.log(e)
  }
}
setAdmin()





