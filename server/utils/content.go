package utils

import (
	"encoding/base64"
	"net/url"
	"strings"
)

func DecodeBase64(input string) (string, error) {
	decodeByte, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		return "", err
	}

	decodeStr, err := url.QueryUnescape(string(decodeByte))
	if err != nil {
		return "", err
	}

	return decodeStr, nil
}

var illegalFileNameCharacters = []string{"#", "%", "&", "{", "}", "\\", ">", "<", "*", "?", "/", "$", "!", "'", "\"", ":", "@", "+", "`", "|", "="}

func NormalizeFileName(fileName string) string {
	var result = fileName
	for i := 0; i < len(illegalFileNameCharacters); i++ {
		result = strings.ReplaceAll(result, illegalFileNameCharacters[i], "_")
	}
	return result
}
