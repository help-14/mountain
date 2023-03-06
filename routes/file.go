package routes

import (
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/help-14/mountain/utils"
)

type IoOperation int
type IoOperationStatus int

const (
	CopyOperation IoOperation = iota
	MoveOperation
	RenameOperation
	DeleteOperation
	CompressOperation
)

const (
	IoOperationStatus_Pending IoOperationStatus = iota
	IoOperationStatus_Processing
	IoOperationStatus_Completed
	IoOperationStatus_Failed
)

type IoTask struct {
	From      string
	To        string
	Path      string
	Operation IoOperation
	Error     error
	Status    IoOperationStatus
}

var PendingIoTasks []IoTask

func CreateIoTask(operation IoOperation, from string, to string, path string) IoTask {
	return IoTask{
		From:      from,
		To:        to,
		Path:      path,
		Operation: operation,
		Error:     nil,
		Status:    IoOperationStatus_Pending,
	}
}

func GetDir(c *gin.Context) {
	rawPath := c.DefaultQuery("path", "/")
	path, err := utils.DecodeBase64(rawPath)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}

	directory := c.Query("directory")

	utils.LogInfo("Request to get files in " + directory + " from " + path)

	files, err := ReadDir(path, directory == "true")
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, files)
}

type CreateBody struct {
	Path      string `json:"path"`
	Name      string `json:"name"`
	Directory bool   `json:"directory"`
	Content   string `json:"content"`
}

func InvalidRequest(c *gin.Context) {
	ReturnErrorMessage(c, http.StatusBadRequest, "Request data is invalid")
}

func Create(c *gin.Context) {
	body := CreateBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	if len(body.Path) == 0 {
		ReturnErrorMessage(c, http.StatusBadRequest, "Invalid path")
		return
	}

	if body.Directory {
		utils.LogInfo("Request to create directory " + body.Name + " in " + body.Path)
	} else {
		utils.LogInfo("Request to create file " + body.Name + " in " + body.Path)
	}

	destination := filepath.Join(body.Path, utils.NormalizeFileName(body.Name))
	err := os.MkdirAll(filepath.Join(body.Path), os.ModePerm)
	if err != nil {
		ReturnError(c, http.StatusInternalServerError, err)
	}

	if body.Directory {
		err = os.MkdirAll(destination, os.ModePerm)
	} else {
		err = utils.CreateFile(destination, body.Content)
	}

	if err == nil {
		c.JSON(http.StatusOK, nil)
	} else {
		ReturnError(c, http.StatusInternalServerError, err)
	}
}

type FromToBody struct {
	From string `json:"from"`
	To   string `json:"to"`
}

func Copy(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	var tasks []IoTask
	for i := 0; i < len(body); i++ {
		current := body[i]
		tasks = append(tasks, CreateIoTask(CopyOperation, current.From, current.To, ""))
	}

	PendingIoTasks = append(PendingIoTasks, tasks...)
	CheckPendingIoTask()
	c.JSON(http.StatusOK, nil)
}

func Move(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	var tasks []IoTask
	for i := 0; i < len(body); i++ {
		current := body[i]
		tasks = append(tasks, CreateIoTask(MoveOperation, current.From, current.To, ""))
	}

	PendingIoTasks = append(PendingIoTasks, tasks...)
	CheckPendingIoTask()
	c.JSON(http.StatusOK, nil)
}

func Rename(c *gin.Context) {
	body := []FromToBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	var tasks []IoTask
	for i := 0; i < len(body); i++ {
		current := body[i]
		tasks = append(tasks, CreateIoTask(RenameOperation, current.From, current.To, ""))
	}

	PendingIoTasks = append(PendingIoTasks, tasks...)
	CheckPendingIoTask()
	c.JSON(http.StatusOK, nil)
}

func Delete(c *gin.Context) {
	body := []string{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}

	var tasks []IoTask
	for i := 0; i < len(body); i++ {
		tasks = append(tasks, CreateIoTask(DeleteOperation, "nil", "", body[i]))
	}

	PendingIoTasks = append(PendingIoTasks, tasks...)
	CheckPendingIoTask()
	c.JSON(http.StatusOK, nil)
}

type CompressBody struct {
	Path  string   `json:"path"`
	Name  string   `json:"name"`
	Type  string   `json:"type"`
	Files []string `json:"files"`
}

func Compress(c *gin.Context) {
	body := CompressBody{}
	if err := c.BindJSON(&body); err != nil {
		InvalidRequest(c)
		return
	}
	utils.LogInfo("Request to compress " + strings.Join(body.Files, ", ") + " from " + body.Path)

	err := utils.Compress(body.Path, body.Name, body.Type, body.Files)
	if err != nil {
		ReturnError(c, 500, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func ConvertFileResponse(path string, file fs.FileInfo) FileResponse {
	var res FileResponse

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

func ReadDir(path string, dirOnly bool) ([]FileResponse, error) {
	result := []FileResponse{}

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

func CheckPendingIoTask() {
	for i := 0; i < len(PendingIoTasks); i++ {
		current := &PendingIoTasks[i]
		if current.Status == IoOperationStatus_Pending {
			current.Status = IoOperationStatus_Processing
			go RunPendingIoTask(current)
			return
		}
	}

	utils.LogInfo("No more IO task to run")
	PendingIoTasks = []IoTask{}
}

func RunPendingIoTask(task *IoTask) {
	var err error

	switch task.Operation {
	case CopyOperation:
		utils.LogInfo("Run task copy from " + task.From + " to " + task.To)
		err = utils.Copy(task.From, task.To)
	case MoveOperation:
		utils.LogInfo("Run task move from " + task.From + " to " + task.To)
		err = utils.Move(task.From, task.To)
	case RenameOperation:
		utils.LogInfo("Run task rename from " + task.From + " to " + task.To)
		err = utils.Rename(task.From, task.To)
	case DeleteOperation:
		utils.LogInfo("Run task  delete " + task.Path)
		err = utils.Delete(task.Path)
	}

	if err == nil {
		task.Status = IoOperationStatus_Completed
	} else {
		task.Status = IoOperationStatus_Failed
		task.Error = err
		utils.LogError(err)
	}

	CheckPendingIoTask()
}
