package api

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/server/utils"
)

func DownloadFile(c *gin.Context) {
	path := c.DefaultQuery("path", "")
	if len(path) == 0 {
		InvalidRequest(c)
		return
	}

	escapePath, err := utils.DecodeBase64(path)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	utils.LogInfo("Request to download from " + escapePath)

	stat, err := os.Stat(escapePath)
	if err != nil {
		ReturnErrorMessage(c, http.StatusInternalServerError, "File not found: "+escapePath)
		return
	}
	var normalizeFileName = utils.NormalizeFileName(stat.Name())

	if stat.IsDir() {
		//create zip stream for multiple files
		c.Writer.Header().Set("Content-type", "application/octet-stream")
		c.Writer.Header().Set("Content-Disposition", "attachment; filename="+normalizeFileName+".zip")
		ar := zip.NewWriter(c.Writer)

		//walk folder and add file to archive
		err := filepath.Walk(path,
			func(filePath string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}

				if info.IsDir() {
					return nil
				}

				arPath := strings.ReplaceAll(filePath, path, "")
				arPath = strings.TrimPrefix(arPath, "/")
				fmt.Println("Zipping " + filePath + " -> " + arPath)

				file, _ := os.Open(filePath)
				f1, _ := ar.Create(arPath)
				io.Copy(f1, file)

				return nil
			})
		if err != nil {
			utils.LogError(err.Error())
		}

		ar.Close()
	} else {
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Transfer-Encoding", "binary")
		c.Header("Content-Disposition", "attachment; filename="+normalizeFileName)
		c.Header("Content-Type", "application/octet-stream")
		c.File(escapePath)
	}
}

func UploadFile(c *gin.Context) {
	form, _ := c.MultipartForm()
	path := form.Value["path"][0]
	files := form.File["files"]
	utils.LogInfo("Request to upload to " + path)

	for _, file := range files {
		c.SaveUploadedFile(file, filepath.Join(path, utils.NormalizeFileName(file.Filename)))
		utils.LogInfo("\t" + file.Filename + " uploaded!")
	}
	c.String(http.StatusOK, fmt.Sprintf("%d files uploaded!", len(files)))
}

func SearchFile(c *gin.Context) {

}
