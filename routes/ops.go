package routes

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func DownloadFile(c *gin.Context) {
	path := c.DefaultQuery("path", "")
	if len(path) == 0 {
		InvalidRequest(c)
		return
	}

	escapePath, err := url.QueryUnescape(path)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	stat, err := os.Stat(escapePath)
	if err != nil {
		ReturnErrorMessage(c, http.StatusInternalServerError, "File not found: "+escapePath)
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+stat.Name())
	c.Header("Content-Type", "application/octet-stream")
	c.File(escapePath)

	//create zip stream for multiple files
	// c.Writer.Header().Set("Content-type", "application/octet-stream")
	// c.Writer.Header().Set("Content-Disposition", "attachment; filename='filename.zip'")
	// ar := zip.NewWriter(c.Writer)
	// file1, _ := os.Open("filename1")
	// file2, _ := os.Open("filename2")
	// f1, _ := ar.Create("filename1")
	// io.Copy(f1, file1)
	// f2, _ := ar.Create("filename1")
	// io.Copy(f2, file2)
	// ar.Close()
}

func UploadFile(c *gin.Context) {
	form, _ := c.MultipartForm()
	path := form.Value["path"][0]
	files := form.File["files"]
	log.Println(form.File)

	for _, file := range files {
		log.Println(file.Filename)
		c.SaveUploadedFile(file, filepath.Join(path, file.Filename))
	}
	c.String(http.StatusOK, fmt.Sprintf("%d files uploaded!", len(files)))
}

func SearchFile(c *gin.Context) {

}
