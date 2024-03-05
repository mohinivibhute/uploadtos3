require("dotenv").config()

const express = require('express')
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const app = express();
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3');


aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,

});
const BUCKET = process.env.BUCKET
const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: BUCKET,
        key: function (req, file, cb) {
            const timestamp = Date.now();
            const originalname = file.originalname;

           const extension = originalname.split('.').pop();
            const key = `${timestamp}_${originalname}`;

            cb(null, key);
        }
    })
});
 
  

app.post('/upload', upload.single('file'), async function (req, res, next) {
    res.send('Successfully uploaded ' + req.file.location + ' location!')
})




app.get("/list", async (req, res) => {

    let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let x = r.Contents.map(item => item.Key);
    res.send(x)
})




app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();
    res.send("File Deleted Successfully")

})


const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
