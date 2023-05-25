const mongoose = require("mongoose");
require('dotenv').config();
const keys = require("../config/keys");
require("../models/User");
jest.setTimeout(30000);

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

afterAll(async () => {
  await mongoose.disconnect();
});
