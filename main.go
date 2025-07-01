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
	router.StaticFS("/js", http.Dir("./js"))
	router.StaticFS("/jpg", http.Dir("./jpg"))
	router.StaticFS("/css", http.Dir("./css"))
	router.GET("/", HandleIndex)
	router.GET("/index.html", HandleIndex)
	router.GET("/jessibuca.html", HandleJessibuca)
	router.GET("/mpegts.html", HandleMpegts)
	router.GET("/hlsjs.html", HandleHlsjs)
	router.GET("/whip.html", HandleWhip)
	router.GET("/whep.html", HandleWhep)
	router.GET("/rtsp.html", HandleRtspOverWebsocket)
	router.GET("/las.html", HandleLas)
	router.GET("/flvjs.html", HandleFlvjs)
	router.GET("/favicon.ico", HandleFavicon)

	router.Run(":8080")
}

func HandleIndex(c *gin.Context) {
	c.HTML(200, "index.html", nil)
}

func HandleJessibuca(c *gin.Context) {
	c.HTML(200, "jessibuca.html", nil)
}

func HandleFavicon(c *gin.Context) {
	c.Status(http.StatusOK)
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

func HandleWhip(c *gin.Context) {
	c.HTML(200, "whip.html", nil)
}

func HandleWhep(c *gin.Context) {
	c.HTML(200, "whep.html", nil)
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
