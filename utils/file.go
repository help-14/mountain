package utils

import (
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/help-14/mountain/response"
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

func Copy(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
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
