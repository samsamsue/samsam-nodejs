const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Hello World!<img src="/getThumb">');
});

// 定义路由
router.get('/mylog-list', async (req, res) => {

    const logModel = require('../models/mylog');

    // const log = new logModel({
    //     content: 'content:'+ (+ new Date()),
    //     date: new Date(),
    // });

    // log.save();

    const list =  await logModel.find({});

    res.json({
        success: true,
        list
    });
});


const ACCOUNT_ID = '76f8a0b6cca454c642c1edb9116a81ec';
const ACCESS_KEY_ID = 'fc9205f676aa0386e29e496b4ec64169';
const SECRET_ACCESS_KEY = '688e662f9360a9a49b89db28491d7819962859adf1cd4be79e9fee08bf692900';

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 临时存储文件



//上传cloudflare r2文件
router.post('/upload',upload.single('file'), async (req, res) => {

    const S3 = require('../utils/s3')
    const file = req.file;
    S3.setBucketName('samsam');
    const result = await S3.upload(file);
    res.json(result);
});

router.post('/getFile', async (req, res) => {
    const S3 = require('../utils/s3')
    res.json(await S3.getUrl('1730166137303_2024-01-31-16-18-30-383751437.png'));
});

router.get('/getThumb', async (req, res) => {
    const S3 = require('../utils/s3')
    res.send(await S3.getThumbnail('1730166137303_2024-01-31-16-18-30-383751437.png', 50, 50));
})

module.exports = router;