package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/utils"
)

func GetDir(c *gin.Context) {
	path := c.DefaultQuery("path", "/")
	files, err := utils.ReadDir(path, false)

	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, files)
}

type CreateBody struct {
	Path      string `json:"path"`
	Directory bool   `json:"directory"`
}

func Create(c *gin.Context) {
	body := CreateBody{}
	if err := c.BindJSON(&body); err != nil {
		ReturnError(c, http.StatusBadRequest, err)
		return
	}

	if len(body.Path) == 0 {
		ReturnErrorMessage(c, http.StatusBadRequest, "Invalid path")
		return
	}

	err := utils.Create(body.Path)
	if err == nil {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnError(c, http.StatusInternalServerError, err)
	}
}

func Copy(c *gin.Context) {

}

func Move(c *gin.Context) {

}

func Rename(c *gin.Context) {

}

func Delete(c *gin.Context) {

}
