package routes

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func SetupHttpRoutes(router *gin.Engine) {
	router.GET("/api/get", GetDir)
	router.POST("/api/create", Create)
	router.POST("/api/copy", Copy)
	router.POST("/api/move", Move)
	router.POST("/api/rename", Rename)
	router.POST("/api/delete", Delete)
	router.POST("/api/compress", Compress)

	router.GET("/api/download", DownloadFile)
	router.POST("/api/upload", UploadFile)
	router.POST("/api/search", SearchFile)

	router.Static("/assets", "./assets")
	router.LoadHTMLGlob("templates/**/*")

	router.GET("/", func(c *gin.Context) {
		defaultPath := os.Getenv("SERVE_PATH")
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title":       "Mountain",
			"defaultPath": defaultPath,
		})
	})
}
