const mongoose = require ('mongoose');
const connectDB = async () => {
    try{
          const conn = await mongoose.connect(process.env.MONGO_URL, err => {
        if(err) throw err;
        console.log('connected to MongoDB')
    });  
          console.log(`Mongodb connected: ${conn.connection.host}`);
    }catch(error){
            console.error(`Error: ${error.message}`);
            process.exit();
    }
};

module.exports = connectDB;