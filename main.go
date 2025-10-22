package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*.html")
	router.StaticFS("/js", gin.Dir("./js", false))
	router.StaticFS("/jpg", gin.Dir("./jpg", false))
	router.StaticFS("/css", gin.Dir("./css", false))
	router.StaticFS("/jessibuca-pro", gin.Dir("./jessibuca-pro", false))
	router.StaticFS("/dash", gin.Dir("./dash", false))
	router.StaticFS("/dist", gin.Dir("./dist", false))
	router.StaticFS("/contrib", gin.Dir("./contrib", false))
	router.GET("/index.html", HandleIndex)
	router.GET("/jessibuca.html", HandleJessibuca)
	router.GET("/mpegts.html", HandleMpegts)
	router.GET("/hlsjs.html", HandleHlsjs)
	router.GET("/whip.html", HandleWhipHtml)
	router.GET("/whep.html", HandleWhepHtml)

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

func HandleWhipHtml(c *gin.Context) {
	c.HTML(200, "whip.html", nil)
}

func HandleWhepHtml(c *gin.Context) {
	c.HTML(200, "whep.html", nil)
}
