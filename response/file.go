package response

import "time"

type FileResponse struct {
	Name      string    `json:"name"`
	Size      int64     `json:"size"`
	Extension string    `json:"ext"`
	Path      string    `json:"path"`
	IsDir     bool      `json:"directory"`
	IsSymLink bool      `json:"symlink"`
	ModTime   time.Time `json:"modified"`
}
