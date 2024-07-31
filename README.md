# gin-player
使用gin加载html和js文件用于播放流媒体协议,主要是HLS、HTTP-FLV、HTTP-Fmp4、WHIP、WHEP

计划集成以下js及其demo，等后期有能力再去修改其demo的代码

(1) [jessibuca](https://github.com/langhuihui/jessibuca)

(2) [mpegts.js](https://github.com/xqq/mpegts.js)

(3) [hls.js](https://github.com/video-dev/hls.js)

(4) [webrtc](https://github.com/cloudflare/workers-sdk/tree/main/templates/stream/webrtc)

# docker运行
```
docker build -y gin-player:init ./

docker run -it -p 8080:8080 gin-player:init

```

# 各个demo播放地址
http://127.0.0.1:8080/mpegts.html

http://127.0.0.1:8080/jessibuca.html

http://127.0.0.1:8080/hlsjs.html