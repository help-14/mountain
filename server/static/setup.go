package static

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func SetupStaticFiles(router *gin.Engine) {
	defaultPath := os.Getenv("SERVE_PATH")
	if len(defaultPath) == 0 {
		defaultPath = "/"
	}
	router.Static("/serve", defaultPath)

	if _, err := os.Stat("/web/assets"); err == nil {
		router.Static("/assets", "../web/assets")
		router.LoadHTMLGlob("web/*.html")
	} else {
		router.Static("/assets", "../web/dist/assets")
		router.Static("/src", "../web/dist")
		router.LoadHTMLGlob("../web/dist/*.html")
	}

	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
}
