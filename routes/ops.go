package routes

import (
	"archive/zip"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/log"
)

func DownloadFile(c *gin.Context) {
	path := c.DefaultQuery("path", "")
	if len(path) == 0 {
		InvalidRequest(c)
		return
	}

	escapeByte, err := base64.StdEncoding.DecodeString(path)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	escapePath, err := url.QueryUnescape(string(escapeByte))
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	log.Info("Request to download from " + escapePath)

	stat, err := os.Stat(escapePath)
	if err != nil {
		ReturnErrorMessage(c, http.StatusInternalServerError, "File not found: "+escapePath)
		return
	}

	if stat.IsDir() {
		//create zip stream for multiple files
		c.Writer.Header().Set("Content-type", "application/octet-stream")
		c.Writer.Header().Set("Content-Disposition", "attachment; filename="+stat.Name()+".zip")
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
			log.Error(err.Error())
		}

		ar.Close()
	} else {
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Transfer-Encoding", "binary")
		c.Header("Content-Disposition", "attachment; filename="+stat.Name())
		c.Header("Content-Type", "application/octet-stream")
		c.File(escapePath)
	}
}

func UploadFile(c *gin.Context) {
	form, _ := c.MultipartForm()
	path := form.Value["path"][0]
	files := form.File["files"]
	log.Info("Request to upload to " + path)

	for _, file := range files {
		c.SaveUploadedFile(file, filepath.Join(path, file.Filename))
		log.Info("\t" + file.Filename + " uploaded!")
	}
	c.String(http.StatusOK, fmt.Sprintf("%d files uploaded!", len(files)))
}

func SearchFile(c *gin.Context) {

}
