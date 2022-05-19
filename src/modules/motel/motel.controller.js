const { Motel } = require('./motel.model')
const { handleCreateImages, fillLinkImages } = require('./motel.help')
const { Image } = require('./motel.model')


class MotelController {
    getMotels(req, res, next) {
       
        const query = req.query
        if (query.title) {
            query.title = {
                $regex:  new RegExp(query.title, "i")
            }
        }
        Motel.find(query).populate('owner', {name:1}).then(motels => {
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
            return res.json(motel)
        })
        .catch(err => next({
            status: 400,
            message: err.message
        }))
        
    }

    async motelDetail(req, res, next) {
        const {id} = req.params
        Motel.findOne({_id: id}).populate('images', {url:1}).populate('owner', {name:1}).then(motel => {
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
                        motel.images.push(images.map(i => i._id))
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
        
        const motel = await Motel.findOne({ _id: id });
        if (motel) {
            
            Image.deleteMany({
                _id: { $nin: req.body.currents.split(' ')},
                motel: id
            }).then(imgs => console.log(imgs)).catch(err => console.log(err))

            if (req.files) {
                const arr = req.files.map(item => {
                    return {
                        motel: id,
                        url: item.path
                    }
                })
                if (arr.length) {
                    Image.insertMany(arr).then(images => {
                        motel.images.push(images.map(i => i._id))
                        motel.save()
                    })
                    .catch(err => {
                        console.log(err)
                        return res.json(err)
                    })
                    
                } 
            } 
            Image.find({motel: id}).then(images => res.json(fillLinkImages(images, req.protocol + '://' + req.get('host')))) 

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
            query.type = 1
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
}

module.exports = new MotelController()