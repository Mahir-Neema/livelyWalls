package utils

import (
	"crypto/rand"
	"encoding/json"
	"math/big"
	"net/http"
)

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func WriteSuccessResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := Response{Success: true, Data: data}
	json.NewEncoder(w).Encode(response)
}

func WriteErrorResponse(w http.ResponseWriter, errorMessage string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := Response{Success: false, Error: errorMessage}
	json.NewEncoder(w).Encode(response)
}

func GenerateRandomPassword() string {
	letters := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	digits := "0123456789"
	specials := "!@#$%^&*"
	all := func(s string, n int) []byte {
		b := make([]byte, n)
		for i := range b {
			r, _ := rand.Int(rand.Reader, big.NewInt(int64(len(s))))
			b[i] = s[r.Int64()]
		}
		return b
	}

	numDigits := 3 + randInt(0, 2)  // 3–5 digits
	numLetters := 8 - numDigits - 1 // remaining letters

	pwd := append(all(digits, numDigits), all(specials, 1)...)
	pwd = append(pwd, all(letters, numLetters)...)

	return string(shuffle(pwd))
}

func randInt(min, max int) int {
	n, _ := rand.Int(rand.Reader, big.NewInt(int64(max-min+1)))
	return int(n.Int64()) + min
}

func shuffle(s []byte) []byte {
	for i := range s {
		j := randInt(0, i)
		s[i], s[j] = s[j], s[i]
	}
	return s
}
