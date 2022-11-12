package routes

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/response"
)

func ReturnError(c *gin.Context, code int, err error) {
	fmt.Println("[Error]", err)
	c.JSON(code, &response.ErrorResponse{Error: err.Error()})
}

func ReturnErrorMessage(c *gin.Context, code int, message string) {
	fmt.Println("[Error] " + message)
	c.JSON(code, &response.ErrorResponse{Error: message})
}
