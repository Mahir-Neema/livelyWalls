package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"net/http"
)

func GetNearbyLocations(w http.ResponseWriter, r *http.Request) {
	location := r.URL.Query().Get("location")
	if location == "" {
		utils.WriteErrorResponse(w, "Location parameter is missing", http.StatusBadRequest)
		return
	}

	locations, err := services.GetNearbyLocations(location)
	if err != nil {
		utils.Logger.Printf("Error getting nearby locations with Gemini for %s: %v", location, err)
		utils.WriteErrorResponse(w, "Failed to get AI suggestions", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, locations, http.StatusOK)
}

type propertyChatRequest struct {
	Message         string                         `json:"message"`
	PreviousFilters *services.PropertySearchIntent `json:"previousFilters,omitempty"`
}

type propertyChatResponse struct {
	Reply              string                        `json:"reply"`
	ClarifyingQuestion string                        `json:"clarifyingQuestion,omitempty"`
	Filters            services.PropertySearchIntent `json:"filters"`
	Properties         []*models.Property            `json:"properties"`
}

func PropertyChat(w http.ResponseWriter, r *http.Request) {
	var request propertyChatRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if request.Message == "" {
		utils.WriteErrorResponse(w, "Message is required", http.StatusBadRequest)
		return
	}

	intent, err := services.ExtractPropertySearchIntent(r.Context(), request.Message, request.PreviousFilters)
	if err != nil {
		utils.Logger.Printf("Error extracting OpenAI property intent: %v", err)
		utils.WriteErrorResponse(w, "Failed to understand property request", http.StatusInternalServerError)
		return
	}

	filters := intent.Filters.ToSearchFilters()
	properties, err := models.SearchProperties(filters, 10)
	if err != nil {
		utils.Logger.Printf("Error searching AI property filters: %v", err)
		utils.WriteErrorResponse(w, "Failed to search properties", http.StatusInternalServerError)
		return
	}
	if properties == nil {
		properties = []*models.Property{}
	}

	utils.WriteSuccessResponse(w, propertyChatResponse{
		Reply:              intent.Reply,
		ClarifyingQuestion: intent.ClarifyingQuestion,
		Filters:            intent.Filters,
		Properties:         properties,
	}, http.StatusOK)
}
