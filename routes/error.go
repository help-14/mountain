package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/log"
	"github.com/help-14/mountain/response"
)

func ReturnError(c *gin.Context, code int, err error) {
	log.Warning(err.Error())
	c.JSON(code, &response.ErrorResponse{Error: err.Error()})
}

func ReturnErrorMessage(c *gin.Context, code int, message string) {
	log.Warning(message)
	c.JSON(code, &response.ErrorResponse{Error: message})
}
