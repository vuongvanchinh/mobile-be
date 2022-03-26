const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Motel = new Schema({
    title: {
        type: String,
        maxlength: 255,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    rentalPrice: {
        type: Number,
        min: 0        
    },
    minRentalPrice:  {
        type: Number,
        min: 0
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true,
        immutable: true
    },
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Image'
        }
    ],
    rate: { type: Number, default: 0},
    censored: {
        type: Boolean,
        default:false
    }
}, {
    timestamps: true
})
Motel.post('remove', function(doc) {
    console.log('%s has been removed', doc._id);
});

/**
 * A Image type
 * @typedef {object} Image
 * @property {string} _id
 * @property {string} url.required
 * @property {string} motel
 */
const Image = new Schema({
    url: { type: String },
    motel: {
        type: Schema.Types.ObjectId,
        ref:'Motel'
    }
})

/**
 * A Rate type
 * @typedef {object} Rate
 * @property {string} user.required
 * @property {number} rate.required
 * @property {string} comment.required
 */
const Rate = new Schema({
    rate: {type: Number, min: 1, max: 5},
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: { type: String }

})
const ImageMotel = mongoose.model('Image', Image)
const MotelModel = mongoose.model('Motel', Motel)
module.exports = {
    Motel:MotelModel, Image: ImageMotel
}