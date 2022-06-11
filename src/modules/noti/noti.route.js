const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth/requireAuthenticate')
const notiController = require('./noti.controller')



/**
 * GET /api/push-noti
 * @tags Noti
 */
 router.get('/push-noti', auth, notiController.pushNoti)


module.exports = router