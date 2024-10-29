
class S3 {
    static ACCOUNT_ID = process.env.S3_ACCOUNT_ID;
    static ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
    static SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
    static bucketName = 'samsam';

    static setBucketName(bucketName){
        this.bucketName = bucketName;
    }

    

    static client(){
        const {S3Client} = require("@aws-sdk/client-s3");
        return new S3Client({
            endpoint: `https://${this.ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: "auto",
            credentials: {
                accessKeyId: this.ACCESS_KEY_ID  ,
                secretAccessKey: this.SECRET_ACCESS_KEY,
            },
        });
    }

    static generateRandomFileName(file){

        const mimes = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif', 
            //视频
            'video/mp4':'mp4',
            'video/webm': 'webm',
            'video/ogg': 'ogg',
            'video/flv': 'flv',
            'video/x-ms-wmv': 'wmv',
        }

        const mine = file.mimetype;
        const crypto = require('crypto');
        const ext = mimes[mine] || 'unknown';
        const randomName = crypto.createHash('md5').update(file.buffer).digest('hex');
        return `${randomName}.${ext}`;
    }

    static async upload(file){
        if (!file) {
            return {
                success: false,
                message: "No file uploaded",
            }
        }
        const fileName = this.generateRandomFileName(file);
        const { PutObjectCommand } = require("@aws-sdk/client-s3");
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
        });
        try {
            await this.client().send(command);
            return {
                success: true,
                message: "Upload successful",
                data: {
                    key: fileName,
                }
            }
        } catch (err) {
            return {
                success: false,
                message: "["+fileName+"]Upload failed:" + err.message,
            }
        }
    }

    static async getUrl(Key){

        const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
        const {  GetObjectCommand } = require("@aws-sdk/client-s3");
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key,
        });
    
        try {
            const url = await getSignedUrl(this.client(), command, { expiresIn: 3600 }); // 过期时间为3600秒（1小时）
            return url;
        } catch (err) {
            return null;
        }
    }

    static async getThumbnail(Key, width, height){
        const {  GetObjectCommand } = require("@aws-sdk/client-s3");
        const sharp = require("sharp");
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key,
        });

        const streamToBuffer = (stream) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        };

        try {
            const response = await this.client().send(command);

            // 将可读流转换为 Buffer
            const imageBuffer = await streamToBuffer(response.Body);
            
            // 使用 sharp 生成缩略图
            const thumbnail = await sharp(imageBuffer)
                .resize(width, height)
                .toBuffer();
    
            // 返回缩略图的 buffer
            return thumbnail;
        } catch (err) {
            console.error("Failed to get thumbnail:", err);
            throw err; // 可以选择抛出错误以便后续处理
        }
    }
}


module.exports = S3;