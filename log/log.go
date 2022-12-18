package log

import (
	"log"
	"os"
	"path"

	"github.com/help-14/mountain/utils"
)

var (
	WarningLogger *log.Logger
	InfoLogger    *log.Logger
	ErrorLogger   *log.Logger
	DebugLogger   *log.Logger
)

func Setup() {
	logFilePath := os.Getenv("LOG_PATH")
	if len(logFilePath) <= 0 {
		logFilePath = path.Join(os.TempDir(), "ocean.log")
	}

	logFile, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Println(err.Error())
		log.Println("Cannot use log file in " + logFilePath + ", using system output.")
	} else {
		log.Println("Writing log to: " + logFilePath)
		InfoLogger = log.New(logFile, "INFO: ", log.Ldate|log.Ltime)
		WarningLogger = log.New(logFile, "WARNING: ", log.Ldate|log.Ltime)
		ErrorLogger = log.New(logFile, "ERROR: ", log.Ldate|log.Ltime)
		DebugLogger = log.New(logFile, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile)
	}
}

func Debug(v ...any) {
	log.Println(v...)
	if utils.IsDebugging() {
		DebugLogger.Println(v...)
	}
}

func Info(v ...any) {
	log.Println(v...)
	if InfoLogger != nil {
		InfoLogger.Println(v...)
	}
}

func Warning(v ...any) {
	log.Println(v...)
	if WarningLogger != nil {
		WarningLogger.Println(v...)
	}
}

func Error(v ...any) {
	log.Println(v...)
	if ErrorLogger != nil {
		ErrorLogger.Println(v...)
	}
}
