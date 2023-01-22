package utils

import (
	"os"
	"path/filepath"
	"strings"

	cp "github.com/otiai10/copy"
)

func SetupServePath() {
	defaultPath := os.Getenv("SERVE_PATH")
	if len(defaultPath) == 0 {
		defaultPath = "/"
	} else {
		os.MkdirAll(defaultPath, 0666)
	}
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
