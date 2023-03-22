package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func QueueIoTask(c *gin.Context) {
	c.JSON(http.StatusOK, PendingIoTasks)
}
