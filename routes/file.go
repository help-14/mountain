package routes

import (
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/utils"
)

func GetDir(c *gin.Context) {
	rawPath := c.DefaultQuery("path", "/")
	path, err := utils.DecodeBase64(rawPath)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	directory := c.Query("directory")

	utils.LogInfo("Request to get files in " + directory + " from " + path)

	files, err := ReadDir(path, directory == "true")
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

func InvalidRequest(c *gin.Context) {
	ReturnErrorMessage(c, http.StatusBadRequest, "Request data is invalid")
}

func Create(c *gin.Context) {
	body := CreateBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	if len(body.Path) == 0 {
		ReturnErrorMessage(c, http.StatusBadRequest, "Invalid path")
		return
	}

	if body.Directory {
		utils.LogInfo("Request to create directory " + body.Name + " in " + body.Path)
	} else {
		utils.LogInfo("Request to create file " + body.Name + " in " + body.Path)
	}

	destination := filepath.Join(body.Path, utils.NormalizeFileName(body.Name))
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

type FromToBody struct {
	From string `json:"from"`
	To   string `json:"to"`
}

func Copy(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	errList := []string{}
	for i := 0; i < len(body); i++ {
		current := body[i]
		utils.LogInfo("Request to copy from " + current.From + " to " + current.To)

		err := utils.Copy(current.From, current.To)
		if err != nil {
			utils.LogError(err.Error())
			errList = append(errList, current.From)
		}
	}

	if len(errList) == 0 {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnErrorMessage(c, http.StatusInternalServerError, "Some files can't be copy.")
	}
}

func Move(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	errList := []string{}
	for i := 0; i < len(body); i++ {
		current := body[i]
		utils.LogInfo("Request to move from " + current.From + " to " + current.To)

		err := utils.Move(current.From, current.To)
		if err != nil {
			utils.LogError(err.Error())
			errList = append(errList, current.From)
		}
	}

	if len(errList) == 0 {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnErrorMessage(c, http.StatusInternalServerError, "Some files can't be move.")
	}
}

func Rename(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	errList := []string{}
	for i := 0; i < len(body); i++ {
		current := body[i]
		utils.LogInfo("Request to rename from " + current.From + " to " + current.To)

		err := utils.Rename(current.From, current.To)
		if err != nil {
			utils.LogError(err.Error())
			errList = append(errList, current.From)
		}
	}

	if len(errList) == 0 {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnErrorMessage(c, http.StatusInternalServerError, "Some files can't be move.")
	}
}

func Delete(c *gin.Context) {
	body := []string{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	errList := []string{}
	for i := 0; i < len(body); i++ {
		utils.LogInfo("Request to delete " + body[i])
		err := utils.Delete(body[i])
		if err != nil {
			utils.LogError(err.Error())
			errList = append(errList, body[i])
		}
	}

	if len(errList) == 0 {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnErrorMessage(c, http.StatusInternalServerError, "Some files can't be deleted.")
	}
}

type CompressBody struct {
	Path  string   `json:"path"`
	Name  string   `json:"name"`
	Type  string   `json:"type"`
	Files []string `json:"files"`
}

func Compress(c *gin.Context) {
	body := CompressBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}
	utils.LogInfo("Request to compress " + strings.Join(body.Files, ", ") + " from " + body.Path)

	err := utils.Compress(body.Path, body.Name, body.Type, body.Files)
	if err != nil {
		ReturnError(c, 500, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func ConvertFileResponse(path string, file fs.FileInfo) FileResponse {
	var res FileResponse

	res.Name = file.Name()
	res.ModTime = file.ModTime()
	res.Path = filepath.ToSlash(filepath.Join(path, file.Name()))

	// Resolve symlink and check IsDir?
	resolvedLink, err := os.Readlink(res.Path)
	if err == nil {
		stat, startErr := os.Stat("/" + resolvedLink)
		if startErr == nil {
			res.IsSymLink = true
			res.IsDir = stat.IsDir()
		} else {
			res.IsDir = file.IsDir()
		}
	} else {
		res.IsDir = file.IsDir()
	}

	if !res.IsDir {
		res.Extension = filepath.Ext(res.Name)
		res.Size = file.Size()
	}

	return res
}

func ReadDir(path string, dirOnly bool) ([]FileResponse, error) {
	result := []FileResponse{}

	files, err := ioutil.ReadDir(path)
	if err != nil {
		return result, err
	}

	for _, file := range files {
		if dirOnly && !file.IsDir() {
			continue
		}
		result = append(result, ConvertFileResponse(path, file))
	}

	return result, nil
}
