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
	Message            string                         `json:"message"`
	PreviousFilters    *services.PropertySearchIntent `json:"previousFilters,omitempty"`
	ConversationHistory []services.ChatMessage         `json:"conversationHistory,omitempty"`
	SearchSource        string                         `json:"searchSource,omitempty"`
}

type propertyChatResponse struct {
	Reply              string                        `json:"reply"`
	ClarifyingQuestion string                        `json:"clarifyingQuestion,omitempty"`
	Filters            services.PropertySearchIntent `json:"filters"`
	Properties         []models.UnifiedProperty      `json:"properties"`
	SourceBreakdown    map[string]int                `json:"sourceBreakdown,omitempty"`
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

	intent, err := services.ExtractPropertySearchIntent(r.Context(), request.Message, request.PreviousFilters, request.ConversationHistory)
	if err != nil {
		utils.Logger.Printf("Error extracting OpenAI property intent: %v", err)
		utils.WriteErrorResponse(w, "Failed to understand property request", http.StatusInternalServerError)
		return
	}

	filters := intent.Filters.ToSearchFilters()
	searchSource := "platform"
	if request.SearchSource != "" {
		searchSource = request.SearchSource
	} else if intent.Filters.SearchSource != nil && *intent.Filters.SearchSource != "" {
		searchSource = *intent.Filters.SearchSource
	}

	limit := int64(10)
	if intent.Filters.Limit != nil && *intent.Filters.Limit > 0 {
		limit = *intent.Filters.Limit
	}
	if (searchSource == "both" || searchSource == "web") && limit < 15 {
		limit = 30
	}

	var platformResults []*models.Property
	var crawlerResults []*models.CrawlerProperty

	if searchSource == "platform" || searchSource == "both" {
		platformResults, err = models.SearchProperties(filters, limit)
		if err != nil {
			utils.Logger.Printf("Error searching platform properties: %v", err)
		}
	}

	if searchSource == "web" || searchSource == "both" {
		crawlerResults, err = models.SearchCrawlerProperties(filters, limit)
		if err != nil {
			utils.Logger.Printf("Error searching crawler properties: %v", err)
		}
	}

	merged := models.MergeAndDeduplicate(platformResults, crawlerResults)

	utils.WriteSuccessResponse(w, propertyChatResponse{
		Reply:              intent.Reply,
		ClarifyingQuestion: intent.ClarifyingQuestion,
		Filters:            intent.Filters,
		Properties:         merged.Properties,
		SourceBreakdown:    merged.SourceBreakdown,
	}, http.StatusOK)
}
