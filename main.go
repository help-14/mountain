package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	routes "github.com/help-14/mountain/routes"
)

func main() {
	router := gin.Default()

	router.GET("/api/get", routes.GetDir)
	router.POST("/api/create", routes.Create)
	router.POST("/api/copy", routes.Copy)
	router.POST("/api/move", routes.Move)
	router.POST("/api/rename", routes.Rename)
	router.POST("/api/delete", routes.Delete)

	router.GET("/api/download", routes.DownloadFile)
	router.POST("/api/upload", routes.UploadFile)
	router.POST("/api/search", routes.SearchFile)

	router.Static("/assets", "./assets")

	router.LoadHTMLGlob("templates/**/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "Mountain",
		})
	})

	router.Run()
}
