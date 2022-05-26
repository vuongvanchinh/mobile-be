const express = require('express')
const router = express.Router()
const userController = require('./user.controller')
const auth = require('../../middleware/auth/requireAuthenticate')
const {isItSelfOrAdmin, isAdmin} = require('../user/user.permission')
const motelController = require('../motel/motel.controller')


/**
 * post /api/user/login
 * @tags User
 * @param {string} email.form.required
 * @param {string} password.form.required
 * @example request - other payload example
 * {
 *   "email": "",
 *   "password": ""
 * }
 */
router.post('/login', userController.login)

/**
 * post /api/user/register
 * @tags User
 * @param {string} email.form.required
 * @param {string} password.form.required
 * @param {string} phone.form.required
 * @param {string} notiToken.form.required
 * @example request - other payload example
 * {
 *   "email": "",
 *   "password": "",
 *   "name": "",
 *   "phone": "",
 *   "notiToken":""
 * }
 */
router.post('/register', userController.register)


router.get('/info', auth, (req, res, next) => {
    res.status(200).json({
        message: "pass"
    })
})
/**
 * get /api/user/stats?role=lesee
 * @tags User
*/
router.get('/stats', userController.stats)


/**
 * get /api/user/my-info
 * @tags User
*/
router.get('/my-info', auth, userController.getCurrentUserInfo)
/**
 * get /api/user/{id}
 * @tags User
 * @param {string} id.path
*/
router.get('/:id', auth, isAdmin, userController.getUserDetail)

/**
 * put /api/user/{id}
 * @tags User
 * @param {string} id.path
 * @param {string} email.form - Optional
 * @param {boolean} active.form.optional - Optional
 * @example request - payload
 * {
 * }
*/
router.put('/:id', isItSelfOrAdmin, userController.updateUser)

/**
 * delete /api/user/{id}
 * @tags User
 * @description only admin
 * @param {string} id.path
 * 
 */
router.delete('/:id', auth, isAdmin, userController.deleteUser)

/**
 * get /api/user
 * @tags User 
 * @param {string} role.query.required - 'admin|lessee|lessor'
 * @param {string} active.query - true|false
 */
router.get('/', auth, isAdmin, userController.getUser)

module.exports = router