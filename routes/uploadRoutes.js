const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const requireLogin = require("../middlewares/requireLogin");
const keys = require("../config/keys");
const uuid = require("uuid/v1");

const client = new S3Client({
  credentials: {
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
  },
  region: "us-east-2",
});

module.exports = (app) => {
  // ask S3 for presigned URL and grab response from S3 send to client
  app.get("/api/upload", requireLogin, async (req, res) => {
    
    const slashIndex = req.query.type.indexOf("/");
    const extension = "." + req.query.type.substring(slashIndex + 1);
    const key = `${req.user._id}/${uuid()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: "node-blog-course",
      ContentType: "image/jpeg",
      Key: key,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    res.send({ key, url });
  });
};
