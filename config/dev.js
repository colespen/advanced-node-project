// module.exports = {
//   googleClientID:
//     "70265989829-0t7m7ce5crs6scqd3t0t6g7pv83ncaii.apps.googleusercontent.com",
//   googleClientSecret: "8mkniDQOqacXtlRD3gA4n2az",
//   mongoURI:
//     "mongodb+srv://colespen:xE81JGkpyYy4Iofv@cluster0.qpby1ts.mongodb.net/advnode?retryWrites=true&w=majority",
//   cookieKey: "123123123",
//   redisUrl: "redis://127.0.0.1:6379",
// };
module.exports = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.DEV_MONGO_URI,
  cookieKey: process.env.COOKIE_KEY,
  redisUrl: process.env.REDIS_URL,
};