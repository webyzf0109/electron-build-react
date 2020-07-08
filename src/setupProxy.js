const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy ('/crawler', { 
       target: 'http://yryd.zjdpf.org.cn' ,
       secure: false,
       changeOrigin: true,
       pathRewrite: {
        "^/crawler": "/crawler"
       }
    }));
};