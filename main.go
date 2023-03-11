package main

import (
	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/routes"
	"github.com/help-14/mountain/utils"
)

func main() {
	utils.SetupLogger()
	utils.SetupServePath()

	router := gin.Default()
	routes.SetupHttpRoutes(router)
	go routes.SetupWebSocket()

	router.Run(":8080")
}
