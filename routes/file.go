package routes

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func getDir(c *gin.Context) {
	roomid := c.Param("roomid")
	nick := c.Query("nick")
	if len(nick) < 2 {
		nick = ""
	}
	if len(nick) > 13 {
		nick = nick[0:12] + "..."
	}
	c.HTML(http.StatusOK, "room_login.templ.html", gin.H{
		"roomid":    roomid,
		"nick":      nick,
		"timestamp": time.Now().Unix(),
	})
}

func create(c *gin.Context) {
}

func copy(c *gin.Context) {

}

func move(c *gin.Context) {

}

func rename(c *gin.Context) {

}

func delete(c *gin.Context) {

}
