var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

//配置
var config = {
    port: 8025,
    denyAccess: ['./httpserver.js', './src/requirecache.js'],
    localIPs: ['localhost','192.168.168.39'],
    srcpath: '/src',
    srcpath: '/src/learn-01/'
};


//开始HTTP服务器
http.createServer(processRequestRoute).listen(config.port);
console.log("Server has started. port:"+config.port);

//路由URL
function processRequestRoute(request, response) {
    var pathname = url.parse(request.url).pathname;
    if (pathname === '/') {
        pathname = "/learn-webRtc/learn-01/index.html"; //默认页面
    }
    var ext = path.extname(pathname);
    var localPath = ''; //本地相对路径
    var staticres = false; //是否是静态资源
    if (ext.length > 0) {
        console.log(config.srcpath+ "1")
        localPath = '.' + pathname;
        staticRes = true;
    } else {
        console.log(config.srcpath)
        localPath = '.' + config.srcpath + pathname + '.js';
        staticRes = false;
    }
    //禁止远程访问  
    if (config.denyAccess && config.denyAccess.length > 0) {
        console.log(config.srcpath+ "2")
        var islocal = false;
        var remoteAddress = request.connection.remoteAddress;
        for (var j = 0; j < config.localIPs.length; j++) {
            if (remoteAddress === config.localIPs[j]) {
                islocal = true;
                break;
            }
        }
        if (!islocal) {
            for (var i = 0; i < config.denyAccess.length; i++) {
                if (localPath === config.denyAccess[i]) {
                    response.writeHead(403, { 'Content-Type': 'text/plain' });
                    response.end('403:Deny access to this page');
                    return;
                }
            }
        }
    }
    //禁止访问后端js
    // if (staticRes && localPath.indexOf(config.srcpath) >= 0) {
    //     response.writeHead(403, { 'Content-Type': 'text/plain' });
    //     response.end('403:Deny access to this page');
    //     return;
    // }

    fs.exists(localPath, function (exists) {

        console.log(0)
        console.log(localPath)
        console.log(exists)
        console.log(staticRes)
        if (exists ||true) {
            console.log(1)
            if (staticRes) {
                console.log(2)
                staticResHandler(localPath, ext, response); //静态资源
            } else {
                console.log(3)
                try {
                    console.log(4)
                    var handler = require(localPath);
                    if (handler.processRequest && typeof handler.processRequest === 'function') {
                        handler.processRequest(request, response); //动态资源
                    } else {
                        response.writeHead(404, { 'Content-Type': 'text/plain' });
                        response.end('404:Handle Not found');
                    }
                } catch (exception) {
                    console.log(5)
                    console.log('error::url:' + request.url + 'msg:' + exception);
                    response.writeHead(500, { "Content-Type": "text/plain" });
                    response.end("Server Error:" + exception);
                }
            }
        } else { //资源不存在
            console.log(6)
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('404:File Not found');
        }
    });
}

//处理静态资源
function staticResHandler(localPath, ext, response) {
    fs.readFile(localPath, "binary", function (error, file) {
        console.log(...arguments)
        if (error && false) {
            console.log(error)
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Server Error:" + error);
        } else {
            response.writeHead(200, { "Content-Type": getContentTypeByExt(ext) });
            response.end(file, "binary");
        }
    });
}

//得到ContentType
function getContentTypeByExt(ext) {
    console.log(ext)
    ext = ext.toLowerCase();
    if (ext === '.htm' || ext === '.html')
        return 'text/html';
    else if (ext === '.js')
        return 'application/x-javascript';
    else if (ext === '.css')
        return 'text/css';
    else if (ext === '.jpe' || ext === '.jpeg' || ext === '.jpg')
        return 'image/jpeg';
    else if (ext === '.png')
        return 'image/png';
    else if (ext === '.ico')
        return 'image/x-icon';
    else if (ext === '.zip')
        return 'application/zip';
    else if (ext === '.doc')
        return 'application/msword';
    else
        return 'text/plain';
}