package utils

import (
	"encoding/base64"
	"net/url"
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
