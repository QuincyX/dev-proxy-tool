const http = require('http'),
    express = require('express'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({
        xfwd: true
    }),
    config = require('./config'),
    fs = require('fs'),
    path = require('path'),
    app = express()

app.use((req, res) => {
    config.forEach(o=> {
        if(req.headers.host == o.host){
            proxy.web(req, res, {
                target: 'http://' + o.proxy
            })
        }
    })
})

var cookie = ""
proxy.on('proxyReq', function (proxyReq, req, res) {
    req.headers.cookie = cookie + req.headers.cookie
    proxyReq._headers = req.headers
    return req
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    var JSESSIONID = proxyRes.headers['set-cookie']
    if (JSESSIONID) {
        cookie = JSESSIONID;
        res.setHeader('Set-Cookie', proxyRes.headers['set-cookie'])
    }
});

proxy.on('error', function (proxyReq, req, res) {
    res.send("<h1>404 Not Found</h1>")
});

console.log("服务已经启动！")

app.listen(80)