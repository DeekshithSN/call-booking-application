const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const generateToken = require("../utils/generateToken");
const { httpRequestTimer, counter } = require('../metrics');

const registerAdmin = asyncHandler(async (req, res) => {
    const apiPath = req.baseUrl;
    const end = httpRequestTimer.startTimer();
    const { username, password } = req.body;

    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
        counter.labels('Admin Already Exists', '400').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        res.status(400)
        throw new Error("Admin Already Exists");
    }

    const admin = await Admin.create({
        username,
        password: bcrypt.hashSync(password, 10)
    });

    if (admin) {
        counter.labels('Admin Created', '201').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id)
        });
    } else {
        counter.labels('Admin Error Occured', '400').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        res.status(400)
        throw new Error("Error occured");
    }

});

const login = asyncHandler(async (req, res) => {
    const apiPath = req.baseUrl;
    const end = httpRequestTimer.startTimer();
    const { username, password } = req.body
    const admin = await Admin.findOne({ username }).select('+password')

    if (!admin) {
        counter.labels('Admin User Not Found', '400').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        throw new Error('Admin User Not Found')
    }
    if (admin.matchPassword(password)) {
        counter.labels('Admin Login Success', '200').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        res.status(200).json(admin)
    } else {
        counter.labels('Admin Invalid Credentials', '400').inc();
        const route = apiPath;
        end({ route, code: res.statusCode, method: req.method });
        throw new Error('Invalid username or password')
    }
})


module.exports = { registerAdmin, login };
