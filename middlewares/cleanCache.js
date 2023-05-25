const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  await next();
  console.log("Cleaning cache for::: ", req.user.id);
  clearHash(req.user.id);
};