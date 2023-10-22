const Router = require('express')
const router = new Router()
const bookingController = require('../controllers/bookingContoller')

router.post('/', bookingController.create)
router.post('/admin', bookingController.createAdmin)
router.delete('/', bookingController.delete)
router.get('/', bookingController.getAll)
router.get('/one', bookingController.getOne)
router.get('/day', bookingController.getOneDay)

module.exports = router