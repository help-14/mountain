package utils

import (
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/help-14/mountain/response"
	cp "github.com/otiai10/copy"
)

func ConvertFileResponse(path string, file fs.FileInfo) response.FileResponse {
	var res response.FileResponse

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

func ReadDir(path string, dirOnly bool) ([]response.FileResponse, error) {
	result := []response.FileResponse{}

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

func Exists(filePath string) bool {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return false
	}
	return true
}

func Copy(src, dst string) error {
	return cp.Copy(src, dst)
}

func Move(src, dst string) error {
	err := Copy(src, dst)
	if err != nil {
		return err
	}
	return Delete(src)
}

func CreateFile(path string, content string) error {
	return os.WriteFile(path, []byte(content), 0666)
}

func Rename(src, dst string) error {
	parent := filepath.Dir(dst)
	err := os.MkdirAll(parent, 0666)
	if err != nil {
		return err
	}
	return os.Rename(src, dst)
}

func Delete(path string) error {
	return os.RemoveAll(path)
}

// check for path traversal and correct forward slashes
func ValidRelPath(p string) bool {
	if p == "" || strings.Contains(p, `\`) || strings.HasPrefix(p, "/") || strings.Contains(p, "../") {
		return false
	}
	return true
}
