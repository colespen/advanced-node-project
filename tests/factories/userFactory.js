const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = () => {
  // returns promise
  return new User({
    // if needed enter google fields here
  }).save(); 
};
