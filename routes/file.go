package routes

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/utils"
)

func GetDir(c *gin.Context) {
	path := c.DefaultQuery("path", "/")
	directory := c.Query("directory")
	files, err := utils.ReadDir(path, directory == "true")

	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, files)
}

type CreateBody struct {
	Path      string `json:"path"`
	Name      string `json:"name"`
	Directory bool   `json:"directory"`
	Content   string `json:"content"`
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

	destination := filepath.Join(body.Path, body.Name)
	err := os.MkdirAll(filepath.Join(body.Path), os.ModePerm)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
	}

	if body.Directory {
		err = os.MkdirAll(destination, os.ModePerm)
	} else {
		err = utils.CreateFile(destination, body.Content)
	}

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
