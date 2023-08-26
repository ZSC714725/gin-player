package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.StaticFS("/js", http.Dir("./js"))
	router.StaticFS("/jpg", http.Dir("./jpg"))
	router.StaticFS("/css", http.Dir("./css"))
	router.GET("/jessibuca.html", HandleJessibuca)
	router.GET("/mpegts.html", HandleMpegts)
	router.GET("/hlsjs.html", HandleHlsjs)
	router.GET("/favicon.ico", HandleFavicon)

	router.Run(":8080")
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
