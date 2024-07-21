const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder');
const Course = require('../models/Course')
const path = require('path')
// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

        
        res.status(200).json(res.advancedResults)
});

// @desc     Get a single bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.findById(req.params.id).populate({
            path: 'courses'
            // select: 'title description'
        });

        if(!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({ success: true, data: bootcamp })
});

// @desc     Create new bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
        req.body.user = req.user.id;
        

        const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

        if(publishedBootcamp && req.user.role !== 'admin'){
            return  next(new ErrorResponse(`The User with id of ${req.user.id} has already published a bootcamp`, 400))
        }

        const bootcamp = await Bootcamp.create(req.body)

        res.status(201).json({ success: true, data: bootcamp })
        
});

// @desc     Update bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async(req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return  next(new ErrorResponse(`User ${req.params.id} cannot update bootcamp`, 400))
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: bootcamp
        })

});

// @desc     Delete bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
  
    //Make sure bootcamp exists
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return  next(new ErrorResponse(`User ${req.params.id} cannot delete bootcamp`, 400))
    }
    
    // Delete bootcamp and associated courses
    await bootcamp.deleteOne();
    await Course.deleteMany( { bootcamp: bootcamp._id });
  
    res.status(200).json({ 
      success: true, 
      data: {} 
    })
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

// @desc     Upload photo for bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    
    if(!bootcamp) {
        return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)) ;
    }
    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return  next(new ErrorResponse(`User ${req.params.id} cannot update bootcamp`, 400))
    }

    if(!req.files) {
        return  next(new ErrorResponse(`Please upload a file`, 400)) ;
    }
    const file = req.files.file;
    if(!file.mimetype.startsWith('image')) {
        return  next(new ErrorResponse(`Please upload an image file`, 400)) ;
    }
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return  next(new ErrorResponse(`Please upload a file less than ${process.env.MAX_FILE_UPLOAD}`, 400)) ;
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.error(err)
            return  next(new ErrorResponse(`Problem with file upload`, 500)) ;
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})
