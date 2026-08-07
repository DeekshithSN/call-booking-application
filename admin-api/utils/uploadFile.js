const { GridFsStorage } = require('multer-gridfs-storage');

const mongoUrl = process.env.MONGO_URL || `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const storage = new GridFsStorage({
  url: mongoUrl,
  options: { useNewUrlParser: true, useUnifiedTopology: true }
});

module.exports = storage;
