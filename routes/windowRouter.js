const Router = require('express')
const router = new Router()
const windowController = require('../controllers/windowController')

router.post('/', windowController.create)
router.delete('/', windowController.delete)
router.get('/', windowController.getAll)
router.get('/one', windowController.getOne)
router.get('/day', windowController.getOneDay)

module.exports = router