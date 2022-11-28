const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(
        createProxyMiddleware('/tmap', {
            target: 'https://apis.openapi.sk.com',
            changeOrigin: true,
        })
    );
    app.use(
        createProxyMiddleware('/v2', {
            target: 'https://kapi.kakao.com',
            changeOrigin: true,
        })
    );
    app.use(
        createProxyMiddleware('/messages', {
            target: 'https://api.solapi.com',
            changeOrigin: true,
        })
    );
};