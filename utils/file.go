package utils

import (
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"syscall"

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

func CopyDirectory(scrDir, dest string) error {
	entries, err := os.ReadDir(scrDir)
	if err != nil {
		return err
	}
	for _, entry := range entries {
		sourcePath := filepath.Join(scrDir, entry.Name())
		destPath := filepath.Join(dest, entry.Name())

		fileInfo, err := os.Stat(sourcePath)
		if err != nil {
			return err
		}

		stat, ok := fileInfo.Sys().(*syscall.Stat_t)
		if !ok {
			return fmt.Errorf("failed to get raw syscall.Stat_t data for '%s'", sourcePath)
		}

		switch fileInfo.Mode() & os.ModeType {
		case os.ModeDir:
			if err := CreateIfNotExists(destPath, 0755); err != nil {
				return err
			}
			if err := CopyDirectory(sourcePath, destPath); err != nil {
				return err
			}
		case os.ModeSymlink:
			if err := CopySymLink(sourcePath, destPath); err != nil {
				return err
			}
		default:
			if err := Copy(sourcePath, destPath); err != nil {
				return err
			}
		}

		if err := os.Lchown(destPath, int(stat.Uid), int(stat.Gid)); err != nil {
			return err
		}

		fInfo, err := entry.Info()
		if err != nil {
			return err
		}

		isSymlink := fInfo.Mode()&os.ModeSymlink != 0
		if !isSymlink {
			if err := os.Chmod(destPath, fInfo.Mode()); err != nil {
				return err
			}
		}
	}
	return nil
}

func Copy(srcFile, dstFile string) error {
	out, err := os.Create(dstFile)
	if err != nil {
		return err
	}

	defer out.Close()

	in, err := os.Open(srcFile)
	defer in.Close()
	if err != nil {
		return err
	}

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}

	return nil
}

func Exists(filePath string) bool {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return false
	}

	return true
}

func CreateIfNotExists(dir string, perm os.FileMode) error {
	if Exists(dir) {
		return nil
	}

	if err := os.MkdirAll(dir, perm); err != nil {
		return fmt.Errorf("failed to create directory: '%s', error: '%s'", dir, err.Error())
	}

	return nil
}

func CopySymLink(source, dest string) error {
	link, err := os.Readlink(source)
	if err != nil {
		return err
	}
	return os.Symlink(link, dest)
}

func Move(src, dst string) error {
	err := CopyDirectory(src, dst)
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
