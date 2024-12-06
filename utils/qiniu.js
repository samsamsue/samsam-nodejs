class qiniu {

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

    static async getToken(){
        var qiniuSDK = require("qiniu");
        const mac = new qiniuSDK.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);
        const options = {
            scope: process.env.QINIU_BUCKET_NAME,
        }

        const putPolicy = new qiniuSDK.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);
        return uploadToken;
    }

    static async upload(file,opts={}){
        var qiniuSDK = require("qiniu");
        const mac = new qiniuSDK.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);
        const options = {
            scope: process.env.QINIU_BUCKET_NAME,
        }

        const putPolicy = new qiniuSDK.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        const config = new qiniuSDK.conf.Config();
        config.zone = qiniuSDK.zone.Zone_z2;

        const formUploader = new qiniuSDK.form_up.FormUploader(config);
        const putExtra = new qiniuSDK.form_up.PutExtra();

        const key = opts.key || this.generateRandomFileName(file);

        try{
            await formUploader.put(uploadToken, key, file.buffer, putExtra);
            return {
                success: true,
                message: "Upload successful",
                data: {
                    key,
                }
            }
        }catch(err){
            return {
                success: false,
                message: "Upload failed",
                data: err
            }
        }
    }


    static signUrl(key,size,type='image'){
        const qiniuSDK = require("qiniu");
        const mac = new qiniuSDK.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);
        const config = new qiniuSDK.conf.Config();
        const bucketManager = new qiniuSDK.rs.BucketManager(mac, config);
        const deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
        let newkey = key;

        if(size){
            newkey = key + '-' + size;
        }
        if(type=='video' && size=='cover'){
            newkey = key + '?vframe/jpg/offset/1';
        }

        
        const privateDownloadUrl = bucketManager.privateDownloadUrl(process.env.QINIU_DOMAIN,newkey, deadline);  
        return privateDownloadUrl;
    }
}

module.exports = qiniu;