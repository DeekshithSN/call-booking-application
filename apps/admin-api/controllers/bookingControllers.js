const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');
const { httpRequestTimer, counter } = require('../metrics');


const updateBooking = asyncHandler(async (req, res) => {
    const apiPath = req.baseUrl;
    const end = httpRequestTimer.startTimer();
    const id = req.params.id
    const booking = await Booking.findById(id)
    if (!booking) {
        counter.labels('Booking not found', '400').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        throw new Error('Booking not found')
    }
    const updatedBooking = await Booking.findByIdAndUpdate(id, { ...req.body }, { new: true })
    
    counter.labels('Booking Updated Successfully', '200').inc();
    const route = apiPath;
    end({ route, code: res.statusCode, method: req.method });
    res.status(200).json(updatedBooking)
})

const getBookings = asyncHandler(async (req, res) => {
    const apiPath = req.baseUrl;
    const end = httpRequestTimer.startTimer();
    const bookings = await Booking.find()
    counter.labels('Bookings Fetched Successfully', '200').inc();
    const route = apiPath;
    end({ route, code: res.statusCode, method: req.method });
    res.status(200).json(bookings)
})

const getBookingImage = asyncHandler(async (req, res) => {
    const apiPath = req.baseUrl;
    const end = httpRequestTimer.startTimer();
    const booking = await Booking.findById(req.params.id)
    const db = mongoose.connection
    const collection = db.collection('images.files');
    const collectionChunks = db.collection('images.chunks');
    const file = await collection.findOne({ filename: booking.image })
    const fileChunks = await collectionChunks.find({ files_id: file._id }).sort({n: 1}).toArray()

    let fileData = [];
    for (let i = 0; i < fileChunks.length; i++) {
        fileData.push(fileChunks[i].data.toString('base64'));
    }
    let finalFile = 'data:' + file.contentType + ';base64,' + fileData.join('');

    counter.labels('Bookings Image Fetched Successfully', '200').inc();
    const route = apiPath;
    end({ route, code: res.statusCode, method: req.method });
    
    res.status(200).json({ file: finalFile })
})

module.exports = { updateBooking, getBookings, getBookingImage };
