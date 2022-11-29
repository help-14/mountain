package utils

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type addToArchiveFunc func(path string) (io.Writer, error)

func baseCompressFn(files []string, addFn addToArchiveFunc) error {
	for i := 0; i < len(files); i++ {
		path := files[i]
		stat, startErr := os.Stat(path)
		if startErr != nil {
			return startErr
		}

		addFileFn := func(filePath string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if info.IsDir() {
				return nil
			}
			arPath := strings.ReplaceAll(filePath, path, "")
			arPath = strings.TrimPrefix(arPath, "/")

			file, err := os.Open(filePath)
			if err != nil {
				return err
			}

			f1, err := addFn(arPath)
			if err != nil {
				return err
			}

			copied, err := io.Copy(f1, file)
			if err != nil {
				fmt.Print(copied)
				return err
			}
			return nil
		}

		if stat.IsDir() {
			err := filepath.Walk(path, addFileFn)
			if err != nil {
				return err
			}
		} else {
			err := addFileFn(path, stat, nil)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func Compress(folder string, fileName string, format string, files []string) error {
	archive, err := os.Create(filepath.Join(folder, fileName+"."+format))
	if err != nil {
		return err
	}
	defer archive.Close()

	switch format {
	case "zip":
		return CompressZip(archive, files)
	case "tar.gz":
		return CompressTarGz(archive, files)
	}
	return nil
}

func Uncompress(archive string, output string) error {
	switch filepath.Ext(archive) {
	case ".zip":
		return UncompressZip(archive, output)
	case ".gz":
		return UncompressTarGz(archive, output)
	}
	return nil
}

func CompressZip(output *os.File, files []string) error {
	writer := zip.NewWriter(output)
	defer writer.Close()

	return baseCompressFn(files, func(filePath string) (io.Writer, error) {
		return writer.Create(filePath)
	})
}

func CompressTarGz(output *os.File, files []string) error {
	var buf bytes.Buffer
	// tar > gzip > buf
	zr := gzip.NewWriter(&buf)
	tw := tar.NewWriter(zr)

	// walk through every file in the folder
	for i := 0; i < len(files); i++ {
		stat, startErr := os.Stat(files[i])
		if startErr != nil {
			return startErr
		}

		addFileFn := func(file string, fi os.FileInfo, err error) error {
			// generate tar header
			header, err := tar.FileInfoHeader(fi, file)
			if err != nil {
				return err
			}
			// must provide real name
			header.Name = filepath.ToSlash(file)
			// write header
			if err := tw.WriteHeader(header); err != nil {
				return err
			}
			// if not a dir, write file content
			if !fi.IsDir() {
				data, err := os.Open(file)
				if err != nil {
					return err
				}
				if _, err := io.Copy(tw, data); err != nil {
					return err
				}
			}
			return nil
		}

		if stat.IsDir() {
			err := filepath.Walk(files[i], addFileFn)
			if err != nil {
				return err
			}
		} else {
			err := addFileFn(files[i], stat, nil)
			if err != nil {
				return err
			}
		}
	}
	// produce tar
	if err := tw.Close(); err != nil {
		return err
	}
	// produce gzip
	if err := zr.Close(); err != nil {
		return err
	}
	// write the .tar.gz
	if _, err := io.Copy(output, &buf); err != nil {
		return err
	}
	return nil
}

func UncompressZip(src string, dest string) error {
	var filenames []string
	reader, _ := zip.OpenReader(src)
	defer reader.Close()
	for _, f := range reader.File {
		fp := filepath.Join(dest, f.Name)
		strings.HasPrefix(fp, filepath.Clean(dest)+string(os.PathSeparator))
		filenames = append(filenames, fp)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fp, os.ModePerm)
			continue
		}
		os.MkdirAll(filepath.Dir(fp), os.ModePerm)
		outFile, _ := os.OpenFile(fp, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		defer outFile.Close()
		rc, _ := f.Open()
		defer rc.Close()
		io.Copy(outFile, rc)
	}
	return nil
}

func UncompressTarGz(src string, dst string) error {
	f, err := os.Open(src)
	if err != nil {
		return err
	}
	defer f.Close()

	// ungzip
	zr, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	// untar
	tr := tar.NewReader(zr)

	// uncompress each element
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break // End of archive
		}
		if err != nil {
			return err
		}
		target := ""
		// validate name against path traversal
		if !ValidRelPath(header.Name) {
			return fmt.Errorf("tar contained invalid name error %q\n", target)
		}
		// add dst + re-format slashes according to system
		target = filepath.Join(dst, header.Name)
		// check the type
		switch header.Typeflag {
		// if its a dir and it doesn't exist create it (with 0755 permission)
		case tar.TypeDir:
			if _, err := os.Stat(target); err != nil {
				if err := os.MkdirAll(target, 0755); err != nil {
					return err
				}
			}
		// if it's a file create it (with same permission)
		case tar.TypeReg:
			fileToWrite, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
			if err != nil {
				return err
			}
			// copy over contents
			if _, err := io.Copy(fileToWrite, tr); err != nil {
				return err
			}
			// manually close here after each file operation; defering would cause each file close
			// to wait until all operations have completed.
			fileToWrite.Close()
		}
	}
	return nil
}
