const { Motel } = require('./motel.model')
const { fillLinkImages } = require('./motel.help')
const { Image } = require('./motel.model')
const User = require('../user/user.model')
const { pushNoti} = require('../../modules/noti/createNoti')

class MotelController {
    clearDb(req, res, next) {
        Motel.deleteMany({}).then(() => res.json("delete")).catch((e) => res.json(e))
    }
    getMotels(req, res, next) {
       
        const query = req.query
        if (query.title) {
            query.title = {
                $regex:  new RegExp(query.title, "i")
            }
        }
        Motel.find(query).populate('images', {url: 1}).populate('owner', {name:1}).then(motels => {
            for(let i = 0; i < motels.length; i++) {
                motels[i].images = fillLinkImages(motels[i].images, req.protocol + '://' + req.get('host'))
            }
            res.json(motels)
        })
        .catch(err => {
            return next({
                status: 400,
                message: err.message
            })
        })
    }

    async createMotel(req, res, next) {
        const body = req.body
        delete body.images 
        body.owner = req.user._id
        const motel = new Motel(body)
        motel.save({new:true}).then(motel => {
            pushNoti(motel.address, req.user._id).then(() => {
                return res.json(motel)
            })
            
        })
        .catch(err => next({
            status: 400,
            message: err.message
        }))
    }

    async motelDetail(req, res, next) {
      
        const {id} = req.params
        Motel.findOne({_id: id}).populate('images', {url:1}).populate('owner', {name:1}).then(motel => {
            if (!motel) {
                return  next({
                    status: 404,
                    message: "not found"
                })
            }
            motel.images = fillLinkImages(motel.images, req.protocol + '://' + req.get('host'))
            return res.json(motel)
        })
        
        .catch(err => next({
            status: 404,
            message: err.message
        })) 
    }

    async updateMotel(req, res, next) {
        const {id} = req.params
        const data = req.body
        delete data.censored
        delete data.rate
        const images = data.images
        delete data.images
        console.log(images)
        Motel.findByIdAndUpdate(id, data, {new: true}).then(motel => {

            res.json(motel)
        }).catch(err => next({
            status: 400,
            message: err.message            
        }))
    }

    async censoredMotel(req, res, next) {
        const {id} = req.params
        const {censored} = req.body
        if (censored !== undefined) {
            Motel.findByIdAndUpdate(id, {censored: censored}, {new: true})
            .then(motel => res.json(motel))
            .catch(err => next({
                status: 400,
                message: err.message
            }))
        } else {
            return next({
                status: 400,
                message: "Censored is required" 
            })
        }
    }

    deleteMotel(req, res, next) {
        const {id} = req.params
        Motel.findByIdAndDelete({_id:id}).then(motel => res.json(motel))
        .catch(err => next({
            status: 404,
            message: err.message
        }))
    }
    
    async uploadImage(req, res, next) {
    
        const {id} = req.params
        const motel = await Motel.findOne({ _id: id });
        if (motel) {
            if (req.files) {
                const arr = req.files.map(item => {
                    return {
                        motel: id,
                        url: item.path
                    }
                })
                if (arr.length) {
                    Image.insertMany(arr).then(function(images){
                        const imgIds = images.map(i => i._id.toString())

                        motel.images.push(...imgIds)
                        if (motel.images.length) {
                            motel.thumbnail = motel.images[0].toString()
                        }
                        motel.save()
                       res.json(fillLinkImages(images, req.protocol + '://' + req.get('host')))
                        
                    }).catch(err => {
                        console.log(err)
                        return res.json(err)
                    })
                } else {
                    next({
                        status: 404,
                        message: "Not found"
                    })
                }
            } else {
                next({
                    status: 404,
                    message: "Not found"
                })
            }           
             
        } else {
            next({
                status: 404,
                message: "Not found"
            })
        }
    }

    async updateMotelImage(req, res, next){
        const {id} = req.params
        console.log("🚀 ~ file: motel.controller.js ~ line 149 ~ MotelController ~ updateMotelImage ~ id", id)
        const f = req.files
        console.log("🚀 ~ file: motel.controller.js ~ line 151 ~ MotelController ~ updateMotelImage ~ f", f)
        
        const motel = await Motel.findOne({ _id: id });
        if (motel) {
            if (req.body.currents) {
                Image.deleteMany({
                    _id: { $nin: req.body.currents.split(' ')},
                    motel: id
                }).then(imgs => console.log(imgs)).catch(err => res.json(err))
            } else {
                Image.deleteMany({
                    motel: id
                }).then(imgs => console.log(imgs)).catch(err => res.json(err))
            }

            const thumbnail = req.body.thumbnail
            console.log("🚀 ~ file: motel.controller.js ~ line 170 ~ MotelController ~ updateMotelImage ~ thumbnail", thumbnail)

            if (req.files.length) {
                const arr = req.files.map(item => {
                    return {
                        motel: id,
                        url: item.path
                    }
                })
                if (arr.length) {
                    Image.insertMany(arr).then(images => {
                        const imgIds = images.map(i => i._id.toString())
                        motel.images.push(...imgIds)
                        if (thumbnail.length < 2 && thumbnail.length > 0) {
                            motel.thumbnail = images[parseInt(thumbnail)]._id.toString()
                        } else if (thumbnail.length > 10){
                            motel.thumbnail = thumbnail
                        }
                        motel.save().then(motel => {
                            Image.find({motel: id}).then(images => res.json(fillLinkImages(images, req.protocol + '://' + req.get('host')))).catch(err => res.json(err))
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        return res.json(err)
                    })
                    
                } else {
                    Image.find({motel: id}).then(images => res.json(fillLinkImages(images, req.protocol + '://' + req.get('host'))))
                    .catch(err => res.json(err))
                }
            } else {
                if (thumbnail === '' || thumbnail === undefined) {
                    motel.thumbnail = null
                } else {
                    motel.thumbnail = thumbnail
                }
                motel.save().then(motel => {
                     Image.find({motel: id}).then(images => res.json(fillLinkImages(images, req.protocol + '://' + req.get('host'))))
                    .catch(err => res.json(err))
                })
            }
            

        } else {
            next({
                status: 404,
                message: "Not found"
            })
        }

    }
    async stats(req, res, next) {
        let query = req.query

        if (Object.keys(query).length === 0) {
            query.postType = 1
        }
        try {
            const zoomate = await Motel.count(query)
            const total = await Motel.count({})
            return res.json({
                total: total,
                primary: zoomate,
                secondary: total - zoomate
            })
        } catch (error) {
            return next({
                status: 400,
                message: error.message
            })
        }
    }

    async toggleFavorite(req, res, next) {
        const {id} = req.params
        console.log("🚀 ~ file: motel.controller.js ~ line 247 ~ MotelController ~ toggleFavorite ~ id", id)
        
        const motel = await Motel.findOne({_id: id})
        const user = await User.findOne({_id: req.user._id})
        let arr = []

        let include = false
        if (user.favoriteMotels) {
            arr = user.favoriteMotels.map(i => {
                if(i.toString() === id) {
                    include = true
                }

                return i.toString()
            })
            // console.log("🚀 ~ file: motel.controller.js ~ line 255 ~ MotelController ~ toggleFavorite ~ arr", arr, include)
        }
        console.log("🚀 ~ file: motel.controller.js ~ line 258 ~ MotelController ~ toggleFavorite ~ arr", arr)

        if (motel) {
            
            if (user) {

                if(!include) {
                    if (!user.favoriteMotels) {
                        user.favoriteMotels = [id]
                    } else {
                        user.favoriteMotels.push(id)
                        
                    }
                    // console.log("🚀 ~ file: motel.controller.js ~ line 258 ~ MotelController ~ toggleFavorite ~ user.favoriteMotels", user.favoriteMotels)
                    
                } else {
                    
                    arr = arr.filter(item => item !== id)

                    // console.log("🚀 ~ file: motel.controller.js ~ line 262 ~ MotelController ~ toggleFavorite ~ arr", arr)
                    
                    user.favoriteMotels = arr
                }
    
                user.save().then(user => {
                    Motel.find({_id: {$in: user.favoriteMotels}}).populate('images').then(motels => {
                        for(let i = 0; i < motels.length; i++) {
                            motels[i].images = fillLinkImages(motels[i].images, req.protocol + '://' + req.get('host'))
                        }
                        

                        res.json({
                            current: !include,
                            currentList: motels
                        })
                    }
                    )
                })
            }
            
        } else {
            if (include) {
                arr = arr.filter(item => item !== id)

                // console.log("🚀 ~ file: motel.controller.js ~ line 262 ~ MotelController ~ toggleFavorite ~ arr", arr)
                
                user.favoriteMotels = arr
                user.save().then(user => {
                    Motel.find({_id: {$in: user.favoriteMotels}}).populate('images').then(motels => {
                        for(let i = 0; i < motels.length; i++) {
                            motels[i].images = fillLinkImages(motels[i].images, req.protocol + '://' + req.get('host'))
                        }
                        

                        res.json({
                            current: !include,
                            currentList: motels
                        })
                    }
                    )
                })

            } else {
                 next({
                    status: 404,
                    message: "not found"
                })
            } 
           
        }

    }

    async myFavoriteMotel (req, res, next) {
        const user = await User.findOne({_id: req.user._id})
        if (user) {
            Motel.find({_id: {$in: user.favoriteMotels}}).populate('images').then(motels => {
                for(let i = 0; i < motels.length; i++) {
                    motels[i].images = fillLinkImages(motels[i].images, req.protocol + '://' + req.get('host'))
                }
                // res.json(motels)
                res.json(motels)
                
            }
            )
        } else {
            return next({
                status: 400,
                message: "please authen"
            })
        }
    }

   
}

module.exports = new MotelController()