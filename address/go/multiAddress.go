package address

import (
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"golang.org/x/crypto/sha3"
)

const okxPrefix = "XKO"

var hexBody = regexp.MustCompile(`^[0-9a-f]{40}$`)

// normalizeBody trims, lowers, strips acceptable prefixes, and validates length/hex.
func normalizeBody(input string, allowXko bool) (string, error) {
	if input == "" {
		return "", errors.New("address must be a string")
	}

	s := strings.TrimSpace(strings.ToLower(input))

	switch {
	case strings.HasPrefix(s, "0x"):
		s = s[2:]
	case allowXko && strings.HasPrefix(s, strings.ToLower(okxPrefix)):
		s = s[3:]
	}

	if len(s) != 40 {
		return "", fmt.Errorf("invalid address length: expected 40 hex chars, got %d", len(s))
	}
	if !hexBody.MatchString(s) {
		return "", errors.New("invalid hex characters in address")
	}
	return s, nil
}

func toChecksumAddress(body string) (string, error) {
	bytes, err := hex.DecodeString(body)
	if err != nil {
		return "", err
	}

	hasher := sha3.NewLegacyKeccak256()
	hasher.Write([]byte(strings.ToLower(body)))
	hash := hasher.Sum(nil)
	hashHex := hex.EncodeToString(hash)

	result := make([]byte, 2+len(body))
	copy(result, "0x")

	for i := 0; i < len(body); i++ {
		ch := body[i]
		if ch >= '0' && ch <= '9' {
			result[2+i] = ch
			continue
		}
		if hashHex[i] >= '8' {
			result[2+i] = strings.ToUpper(string(ch))[0]
		} else {
			result[2+i] = ch
		}
	}

	_ = bytes // keeps linter happy if you remove extra logic later
	return string(result), nil
}

func ToEvmAddress(input string) (string, error) {
	body, err := normalizeBody(input, true)
	if err != nil {
		return "", err
	}
	return toChecksumAddress(body)
}

func FromEvmAddress(input string) (string, error) {
	body, err := normalizeBody(input, false)
	if err != nil {
		return "", err
	}
	checksum, err := toChecksumAddress(body)
	if err != nil {
		return "", err
	}
	return okxPrefix + checksum[2:], nil
}