package main

import (
	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/server/api"
	"github.com/help-14/mountain/server/middleware"
	"github.com/help-14/mountain/server/static"
	"github.com/help-14/mountain/server/utils"
)

func main() {
	utils.SetupLogger()
	utils.SetupServePath()

	router := gin.Default()
	if utils.IsDebugging() {
		router.Use(middleware.CORSMiddleware())
	}

	go api.SetupWebSocket()
	api.SetupApi(router)
	static.SetupStaticFiles(router)

	router.Run(":8080")
}
