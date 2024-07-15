const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const colors = require('colors')

dotenv.config({path: './config/config.env'})

//connnec to db
mongoose.connect(process.env.MONGO_URI)

//read bootcamp data
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))

//import Bootcamp model
const Bootcamp = require('./models/Bootcamp');

//add bootcamp to database
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)

        console.log(`Completed Adding bootcamps`.green.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

//delete bootcamp from database
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()

        console.log(`Completed Deleting bootcamps`.red.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

if(process.argv[2] === '-i'){
    importData();
}
else if(process.argv[2] === '-d') {
    deleteData()
}
