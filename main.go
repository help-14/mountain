package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	routes "github.com/help-14/mountain/routes"
)

func main() {
	router := gin.Default()

	router.GET("/api/get", routes.GetDir)
	router.POST("/api/create", routes.GetDir)
	router.POST("/api/copy", routes.GetDir)
	router.POST("/api/move", routes.GetDir)
	router.POST("/api/rename", routes.GetDir)
	router.DELETE("/api/delete", routes.GetDir)

	// However, this one will match /user/john/ and also /user/john/send
	// If no other routers match /user/john, it will redirect to /user/john/
	// router.GET("/api/:name/*action", func(c *gin.Context) {
	// 	name := c.Param("name")
	// 	action := c.Param("action")
	// 	message := name + " is " + action
	// 	c.String(http.StatusOK, message)
	// })

	// For each matched request Context will hold the route definition
	// router.POST("/user/:name/*action", func(c *gin.Context) {
	// 	b := c.FullPath() == "/user/:name/*action" // true
	// 	c.String(http.StatusOK, "%t", b)
	// })

	// This handler will add a new router for /user/groups.
	// Exact routes are resolved before param routes, regardless of the order they were defined.
	// Routes starting with /user/groups are never interpreted as /user/:name/... routes
	// router.GET("/user/groups", func(c *gin.Context) {
	// 	c.String(http.StatusOK, "The available groups are [...]")
	// })

	router.Static("/assets", "./assets")

	router.LoadHTMLGlob("templates/**/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "Mountain",
		})
	})

	router.Run()
}
