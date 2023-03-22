package api

import (
	"github.com/gin-gonic/gin"
)

func SetupApi(router *gin.Engine) {

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

	router.GET("/api/queue/io", QueueIoTask)
}
