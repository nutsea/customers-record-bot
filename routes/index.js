const Router = require('express')
const router = new Router()
const clientRouter = require('./clientRouter')
const bookingRouter = require('./bookingRouter')
const windowRouter = require('./windowRouter')

router.use('/client', clientRouter)
router.use('/booking', bookingRouter)
router.use('/window', windowRouter)

module.exports = router