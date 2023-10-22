const Router = require('express')
const router = new Router()
const clientController = require('../controllers/clientController')

router.post('/', clientController.create)
router.put('/', clientController.update)
router.delete('/', clientController.delete)
router.get('/', clientController.getAll)
router.get('/limit', clientController.getLimit)
router.get('/one', clientController.getOne)
router.get('/search', clientController.getBySearch)
router.get('/bookings', clientController.findBookings)

module.exports = router