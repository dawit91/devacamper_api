const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder');


// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        let query;
        let reqQuery = { ...query}
        const removeFields = ['select', 'sort', 'page', 'limit']
        

        let queryStr = JSON.stringify(reqQuery)
        removeFields.forEach( field => delete(reqQuery.field))
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte|in)\b/g, match => `$${match}`)

        console.log(queryStr)
        query = Bootcamp.find(JSON.parse(queryStr))

        //filter
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ')
            query = query.select(fields)
        }

        // sort
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        }
        else {
            query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit)

        //Pagination
        const pagination = {}
        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        const bootcamps = await query
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            pagination,
            data: bootcamps
        })
});

// @desc     Get a single bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({ success: true, data: bootcamp })
});

// @desc     Create new bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.create(req.body)
        if(!bootcamp) {
            return res.status(400).json({
                success: false
            })
        }
        res.status(201).json({
           success: true,
           data: bootcamp
        })
        
});

// @desc     Update bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async(req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        })

});

// @desc     Delete bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async(req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

        if(!bootcamp) {
            return  next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404))
        
        }
        res.status(200).json({success: true, data: {}})
});

// @desc     Get bootcamps in a radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampByRadius = asyncHandler(async(req, res, next) => {
    const {zipcode, distance} = req.params;
    
    const loc = await geocoder.geocode(zipcode)
    const lng = loc[loc.length - 1].longitude
    const lat = loc[loc.length - 1].latitude
    console.log(distance, lng, lat)
    //Earth radius
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
         }
    })

    res.status(200).json({Success: true, count: bootcamps.length, data: bootcamps})
});