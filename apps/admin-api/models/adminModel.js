const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Admin = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

Admin.methods.matchPassword = function(enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

// // will encrypt password everytime its saved
// adminSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

module.exports = mongoose.model("Admin", Admin, 'admins');
