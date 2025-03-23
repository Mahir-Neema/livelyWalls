package utils

import (
	"context"
	"encoding/json"
	"net/http"

	"google.golang.org/api/idtoken"
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

func VerifyGoogleToken(token string) (map[string]interface{}, error) {
	// Replace with your Google client ID
	clientID := "YOUR_GOOGLE_CLIENT_ID"

	// Validate the token using Google's ID token verifier
	payload, err := idtoken.Validate(context.Background(), token, clientID)
	if err != nil {
		return nil, err
	}

	// Extract user info from the token payload
	userInfo := make(map[string]interface{})
	if email, ok := payload.Claims["email"]; ok {
		userInfo["email"] = email
	}
	if name, ok := payload.Claims["name"]; ok {
		userInfo["name"] = name
	}
	if picture, ok := payload.Claims["picture"]; ok {
		userInfo["picture"] = picture
	}

	return userInfo, nil
}
