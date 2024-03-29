package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/utils"
)

func ReturnError(c *gin.Context, code int, err error) {
	utils.LogWarning(err.Error())
	c.JSON(code, &ErrorResponse{Error: err.Error()})
}

func ReturnErrorMessage(c *gin.Context, code int, message string) {
	utils.LogWarning(message)
	c.JSON(code, &ErrorResponse{Error: message})
}
