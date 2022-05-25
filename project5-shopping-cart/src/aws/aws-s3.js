const AWS = require("aws-sdk")

AWS.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFiles = async (file) => {
    return new Promise(function (resolve, reject) {
        const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
        const uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Group20/ProjectManagement/" + file.originalname,
            Body: file.buffer
        };
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log(err);  // final submit me hatana h
                return reject({ "Error": err })
            }
            return resolve(data.Location)
        })
    });


};

module.exports = { uploadFiles }