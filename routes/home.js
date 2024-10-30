const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Hello World!<img src="/getThumb">');
});

router.post('/mylog-delete', async (req, res) => {
    const {id} = req.body;
    const logModel = require('../models/mylog');
    try{
        await logModel.findByIdAndDelete(id);
        res.json({
            success:true,
            message:'删除成功'
        })
    }catch(e){
        res.json({
            success:false,
            message:'删除出错了：'+e.message
        })
    }
})

router.post('/mylog-submit', async(req,res)=>{
    const {content, mediaList} = req.body;

    if(content === '' && (mediaList||[]).length < 1){
        return res.json({
            success:false,
            message:'你咋啥也没写'
        })
    }
    const logModel = require('../models/mylog');
    const log = new logModel({
        content,
        date: new Date(),
        mediaList
    });

    try{
        await log.save();
        res.json({
            success:true,
            message:'发表成功'
        })
    }catch(e){
        res.json({
            success:false,
            message:'发表出错了：'+e.message
        })
    }




})

// 定义路由
router.get('/mylog-list', async (req, res) => {

    const logModel = require('../models/mylog');
    const list =  await logModel.find({}).sort({date:-1});

    const S3 = require('../utils/s3')


    for(let row of list){
        if(row.mediaList.length > 0){
            for(let index in row.mediaList){
                const key = row.mediaList[index];
                row.mediaList[index] = await S3.getUrl(key)
            }
        }
    }

    console.log(list)

    res.json({
        success: true,
        list
    });
});


const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



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
    res.send(await S3.getThumbnail('dana-ward-yrCqlIUA2V8-unsplash.jpg', 50, 50));
})

module.exports = router;