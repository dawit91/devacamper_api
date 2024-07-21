const express = require('express')
const router = express.Router()
const {getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampByRadius, bootcampPhotoUpload} = require('../controllers/bootcamps')
const Bootcamp = require('../models/Bootcamp')
const courseRouter = require('./courses')
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id/photo').put(protect, bootcampPhotoUpload)
router.use('/:bootcampId/courses', courseRouter)
router.route('/radius/:zipcode/:distance').get(getBootcampByRadius)
router.route('/')
.get(advancedResults(Bootcamp,'courses'),getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp)

router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp)


module.exports = router