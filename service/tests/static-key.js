const { getStaticKey } = require('./../config.service')

console.log(getStaticKey())

setTimeout(() => {
  console.log(getStaticKey())
}, 750)

setTimeout(() => {
  console.log(getStaticKey())
}, 1500)

setTimeout(() => {
  console.log(getStaticKey())
}, 2250)

setTimeout(() => {
  console.log(getStaticKey())
}, 3000)

setTimeout(() => {
  console.log(getStaticKey())
}, 3750)

setTimeout(() => {
  console.log(getStaticKey())
}, 4500)
