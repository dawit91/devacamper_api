const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course')
const asyncHandler = require('../middleware/async')

// @desc     Get courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/courses/:bootcampId/courses
// @access   Public

exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if(req.params.bootcampId){
        query = Course.find({bootcamp: req.params.bootcampId})
    }
    else {
        query = Course.find();
        
    }
    const courses = await query;
    res.status(200).json({
        sucess: true,
        count: courses.length,
        data: courses
    })
});