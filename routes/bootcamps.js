const express = require('express')
const router = express.Router()
const {getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampByRadius} = require('../controllers/bootcamps')
module.exports = router

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius)
router.route('/')
.get(getBootcamps)
.post(createBootcamp)

router.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp)