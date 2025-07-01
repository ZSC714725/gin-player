package main

import (
	"fmt"
	"net/http"
	"text/template"

	_ "embed"

	"github.com/gin-gonic/gin"
)

//go:embed templates/whip.html
var whipTpl string

//go:embed templates/whep.html
var whepTpl string

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*.html")
	router.StaticFS("/js", gin.Dir("./js", false))
	router.StaticFS("/jpg", gin.Dir("./jpg", false))
	router.StaticFS("/css", gin.Dir("./css", false))
	router.StaticFS("/jessibuca-pro", gin.Dir("./jessibuca-pro", false))
	router.GET("/index.html", HandleIndex)
	router.GET("/jessibuca.html", HandleJessibuca)
	router.GET("/mpegts.html", HandleMpegts)
	router.GET("/hlsjs.html", HandleHlsjs)
	router.GET("/whip", HandleWebRtcjs)
	router.GET("/whep", HandleWebRtcjs)
	router.GET("/rtsp.html", HandleRtspOverWebsocket)
	router.GET("/las.html", HandleLas)
	router.GET("/flvjs.html", HandleFlvjs)
	router.GET("/favicon.ico", HandleFavicon)

	router.Run(":8087")
}

func HandleIndex(c *gin.Context) {
	c.HTML(200, "index.html", nil)
}

func HandleJessibuca(c *gin.Context) {
	c.HTML(200, "jessibuca.html", nil)
}

func HandleFavicon(c *gin.Context) {
	c.Status(200)
}

func HandleMpegts(c *gin.Context) {
	c.HTML(200, "mpegts.html", nil)
}

func HandleHlsjs(c *gin.Context) {
	c.HTML(200, "hlsjs.html", nil)
}

func HandleRtspOverWebsocket(c *gin.Context) {
	c.HTML(200, "rtsp.html", nil)
}

func HandleLas(c *gin.Context) {
	c.HTML(200, "las.html", nil)
}

func HandleFlvjs(c *gin.Context) {
	c.HTML(200, "flvjs.html", nil)
}

type WebRtcInfo struct {
	URL string
}

// http://127.0.0.1:8080/whip?url=xxxx
// http://127.0.0.1:8080/whep?url=xxxx
func HandleWebRtcjs(c *gin.Context) {
	rtcUrl := c.Query("url")
	if rtcUrl == "" {
		fmt.Println("query url is empty")
		c.Status(http.StatusBadRequest)
		return
	}

	path := c.Request.URL.Path
	fmt.Println("handle webrtc, path:", path)
	switch path {
	case "/whip":
		// 处理whip请求
		handleWhip(c, rtcUrl)
	case "/whep":
		// 处理whep请求
		handlewhep(c, rtcUrl)
	}
}

func handleWhip(c *gin.Context, url string) {
	t, err := template.New("whip").Parse(whipTpl)
	if err != nil {
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}

	info := WebRtcInfo{
		URL: url,
	}

	c.Writer.Header().Set("Content-Type", "text/html")
	c.Writer.WriteHeader(http.StatusOK)
	t.Execute(c.Writer, info)
}

func handlewhep(c *gin.Context, url string) {
	t, err := template.New("whep").Parse(whepTpl)
	if err != nil {
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}

	info := WebRtcInfo{
		URL: url,
	}

	c.Writer.Header().Set("Content-Type", "text/html")
	c.Writer.WriteHeader(http.StatusOK)
	t.Execute(c.Writer, info)
}
