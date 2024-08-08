# gin-player
使用gin加载html和js文件用于播放流媒体协议,主要是HLS、HTTP-FLV、HTTP-Fmp4、WHIP、WHEP

计划集成以下js及其demo，等后期有能力再去修改其demo的代码

(1) [jessibuca](https://github.com/langhuihui/jessibuca)

(2) [mpegts.js](https://github.com/xqq/mpegts.js):主要播放HTTP-FLV,支持HEVC

(3) [hls.js](https://github.com/video-dev/hls.js):主要播放HLS协议

(4) [webrtc](https://github.com/cloudflare/workers-sdk/tree/main/templates/stream/webrtc):支持WHIP和WHEP

(5) [rtsp over websocket](https://github.com/cnotch/ipchub/tree/main/demos/rtsp):支持rtsp over websocket

(6) [LAS](https://github.com/KwaiVideoTeam/las/tree/master/client/las.js):支持las协议,增加debug打印，打印pts和请求url

# docker运行
```
docker build -y gin-player:init ./

docker run -it -p 8080:8080 gin-player:init

```

# 各个demo播放地址
http://127.0.0.1:8080/mpegts.html

http://127.0.0.1:8080/jessibuca.html

http://127.0.0.1:8080/hlsjs.html

http://127.0.0.1:8080/whep?url=<WHEP播放url>

http://127.0.0.1:8080/whip?url=<WHIP推流url>

http://127.0.0.1:8080/rtsp.html

http://127.0.0.1:8080/las.html

## LAS各分辨率 mainfest.json示例
```
{
    "version": "1.0.0",
    "adaptationSet": [
        {
            "duration": 1000,
            "id": 1,
            "representation": [
                {
                    "id": 1,
                    "codec": "avc1.64001e,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test_ld500d.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 700,
                    "width": 640,
                    "height": 360,
                    "frameRate": 25,
                    "qualityType": "SMOOTH",
                    "qualityTypeName": "流畅",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": true
                },
                {
                    "id": 2,
                    "codec": "avc1.64001f,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test_sd1000d.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 1300,
                    "width": 960,
                    "height": 540,
                    "frameRate": 25,
                    "qualityType": "STANDARD",
                    "qualityTypeName": "标清",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": false
                },
                {
                    "id": 3,
                    "codec": "avc1.64001f,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 2300,
                    "width": 1280,
                    "height": 720,
                    "frameRate": 30,
                    "qualityType": "HIGH",
                    "qualityTypeName": "高清",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": false
                }
            ]
        }
    ]
}
```