const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys")

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    console.log("mongoose exec");
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // see if we have value for key in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // if we do, return it
  if (cacheValue) {
    console.log("cachedValue");
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // otherwise issue query and store the result in redis
  const result = await exec.apply(this, arguments);
  console.log("set redis -> mongoose exec results");
  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 1);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
