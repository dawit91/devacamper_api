const mongoose = require('mongoose')

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,
        required: [true, 'Please add weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition fee']
    },
    minimumSkill: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'Please add minimum skill required']
    },
    scholarshipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: [true, 'Please add a bootcamp']
    }
})

courseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (error) {
        console.error(error)
    }
}

courseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp)
})

courseSchema.pre('remove', function() { 
    this.constructor.getAverageCost(this.bootcamp)
})

module.exports = new mongoose.model('Course', courseSchema)