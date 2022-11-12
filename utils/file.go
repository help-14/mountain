package utils

import (
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/help-14/mountain/response"
)

func ConvertFileResponse(path string, file fs.FileInfo) response.FileResponse {
	var res response.FileResponse

	res.Name = file.Name()
	res.ModTime = file.ModTime()
	res.Path = filepath.Join(path, file.Name())

	// Resolve symlink and check IsDir?
	resolvedLink, err := os.Readlink(res.Path)
	if err == nil {
		fmt.Println("/" + resolvedLink)
		stat, startErr := os.Stat("/" + resolvedLink)
		if startErr == nil {
			res.IsSymLink = true
			res.IsDir = stat.IsDir()
		} else {
			fmt.Println(startErr.Error())
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

func Create(path string) error {
	fileName := path[:strings.LastIndex(path, "/")+1]
	if strings.Contains(fileName, ".") {
		//create file
		_, err := os.Create("empty.txt")
		return err

	} else {
		//create folder
		return os.MkdirAll(path, 0755)
	}
}

func Rename(src, dst string) error {
	return os.Rename(src, dst)
}

func Delete(path string) error {
	return os.Remove(path)
}
