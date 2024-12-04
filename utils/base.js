class Base {

    static isTest = false;

    static model(){
        const path = require('path');
        const rootDir = path.dirname(require.main.filename);
        return require( rootDir+'/models/mylog'+ (this.isTest? 'test' : ''));
    }

    static getToken(headers){
        const authHeader = headers['authorization'];
        if (!authHeader) {
            return false;
        }
        const token = authHeader.split(' ')[1];
        return token;
    }

    static checkAuth(req) {
        const token = this.getToken(req.headers);

        const protocol = req.protocol; // 获取协议（http 或 https）
        const host = req.get('host');  // 获取域名和端口（例如：10.0.5.125:4000）
        const fullUrl = `${protocol}://${host}`; //
        
        const isLocal = fullUrl === 'http://10.0.5.125:4000';

        //本地测试
        if(token === 'test' && isLocal) {
            this.isTest = true;
            return true;
        }else{
            this.isTest = false;
        }
        
        if (token !== process.env.AUTH_TOKEN) {
            return false;
        }
        return true;
    }
}

module.exports = Base;