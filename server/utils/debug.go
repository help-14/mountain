package utils

import (
	"os"

	"github.com/mitchellh/go-ps"
)

var debuggerCount int = 0

func IsDebugging() bool {
	if debuggerCount != 0 {
		return debuggerCount > 0
	}

	pid := os.Getppid()
	for pid != 0 {
		switch p, err := ps.FindProcess(pid); {
		case err != nil:
			return false
		case p.Executable() == "dlv":
			debuggerCount = 1
			return true
		default:
			pid = p.PPid()
		}
	}
	debuggerCount = -1
	return false
}
