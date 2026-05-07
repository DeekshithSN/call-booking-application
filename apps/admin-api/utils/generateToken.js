const jwt = require("jsonwebtoken");

//Adding the backticks solved the problem

const generateToken = (id) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: "30d",
  });
};

module.exports= generateToken;
