import aws from "aws-sdk";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: ".env" })

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: 'us-east-1'
})

var s3 = new aws.S3();
//TODO : Handle error 
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'restroworkscarental',
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + uuidv4();
            cb(null, "file_" + uniqueSuffix + "_" + file.originalname);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB file size limit
    }
})

export default upload;