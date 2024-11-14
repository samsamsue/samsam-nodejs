const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {

    const qiniu = require('../utils/qiniu');
    const url = qiniu.signUrl('7ba7b5fc986aa227ecb7e8688d69fa1b.png','small');

    // res.send(`
    //     <img src="${url}">
    //     <form action="/upload-qn" method="post" enctype="multipart/form-data">
    //         <input type="file" name="file">
    //         <button type="submit">上传</button>
    //     </form>
    // `);

    res.send(`<img src="${url}">`);
});

router.post('/mylog-delete', async (req, res) => {
    if(!checkAuth(req.headers)){
        return res.json({
            success:false,
            needAuth:true,
            message:'无效的授权'
        })
    }
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
    if(!checkAuth(req.headers)){
        return res.json({
            success:false,
            needAuth:true,
            message:'无效的授权'
        })
    }

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


function checkAuth(headers) {
    const authHeader = headers['authorization'];
    if(!authHeader){
        return false;
    } 
    const token = authHeader.split(' ')[1];
    if(!token){
        return false;
    }
    if(token !== process.env.AUTH_TOKEN){
        return false;
    }
    return true;
}


// 定义路由
router.post('/mylog-list', async (req, res) => {

    if(!checkAuth(req.headers)){
        return res.json({
            success:false,
            needAuth:true,
            message:'无效的授权'
        })
    }
    
    const logModel = require('../models/mylog');

    const {page,filter} = req.body;

    const findParams = {};

    if(filter ){
        if(Array.isArray(filter.dateRange) && filter.dateRange.length === 2){
            const moment = require('moment-timezone');
            const timeZone = 'Asia/Shanghai';
            const [start, end] = filter.dateRange;
            // 将 start 和 end 转换为指定时区的时间
            const startDate = moment.tz(start, timeZone).startOf('day').toDate();
            const endDate = moment.tz(end, timeZone).endOf('day').toDate();
            findParams.date = { $gte: startDate, $lte: endDate };
        }
        if(filter.word){
            findParams.content = new RegExp(filter.word);
        }
    }



    const pageNum = parseInt(page) || 1;
    const pageSize = 10;
    const total = await logModel.countDocuments({});
    const totalPage = Math.ceil(total/pageSize);
    const list = await logModel.find(findParams).sort({date:-1}).skip((pageNum-1)*pageSize).limit(pageSize);

    // const S3 = require('../utils/s3')

    const qiniu = require('../utils/qiniu');


    for(let row of list){
        if(row.mediaList.length > 0){
            for(let index in row.mediaList){
                const key = row.mediaList[index];
                row.mediaList[index] = {
                    thumb:await qiniu.signUrl(key,'small'),
                    medium:await qiniu.signUrl(key,'medium'),
                    url:await qiniu.signUrl(key)
                }
            }
        }
    }

    res.json({
        success: true,
        list,
        totalPage,
        page
    });
});


const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/upload-qn', upload.single('file'), async (req, res) => {

});

//上传到七牛云
router.post('/qiniu-token', upload.single('file'), async (req, res) => {
    if(!checkAuth(req.headers)){
        return res.json({
            success:false,
            needAuth:true,
            message:'无效的授权'
        })
    }
    const qiniu = require('../utils/qiniu');
    const token = await qiniu.getToken();
    res.json({
        success: true,
        message: 'ok',
        data:{
            token
        }
    });
});

//上传cloudflare r2文件
router.post('/upload',upload.single('file'), async (req, res) => {

    if(!checkAuth(req.headers)){
        return res.json({
            success:false,
            needAuth:true,
            message:'无效的授权'
        })
    }

    const sizes = [
        {width:300,height:300, suffix:'small'},
        {width:800,height:800, suffix:'medium'},
    ]

    const S3 = require('../utils/s3')
    const file = req.file;
    
    S3.setBucketName('samsam');
    const result = await S3.upload(file,{
        sizes
    });
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