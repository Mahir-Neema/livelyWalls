package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
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

	searchCallback := func(filters map[string]interface{}, searchSource string, limit int64) (int, string, interface{}) {
		var platformResults []*models.Property
		var crawlerResults []*models.CrawlerProperty
		var err error

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
		summary := fmt.Sprintf("Found %d properties across sources.", len(merged.Properties))
		
		if len(merged.Properties) > 0 {
			var details []string
			for i, p := range merged.Properties {
				if i >= 3 {
					break // Only summarize top 3 to LLM
				}
				details = append(details, fmt.Sprintf("- %s (Rent: %d, Type: %s, Bedrooms: %d, Location: %s)", p.Title, p.Rent, p.PropertyType, p.Bedrooms, p.Location))
			}
			summary += "\nTop matches:\n" + strings.Join(details, "\n")
		}

		return len(merged.Properties), summary, merged
	}

	intent, rawProps, err := services.RunPropertySearchAgent(r.Context(), request.Message, request.PreviousFilters, request.ConversationHistory, request.SearchSource, searchCallback)
	if err != nil {
		utils.Logger.Printf("Error running property search agent: %v", err)
		utils.WriteErrorResponse(w, "Failed to understand property request", http.StatusInternalServerError)
		return
	}

	var finalMerged models.MergedProperties
	if rawProps != nil {
		if mp, ok := rawProps.(models.MergedProperties); ok {
			finalMerged = mp
		}
	}

	// In case the agent didn't search but just replied, return empty or default
	utils.WriteSuccessResponse(w, propertyChatResponse{
		Reply:              intent.Reply,
		ClarifyingQuestion: intent.ClarifyingQuestion,
		Filters:            intent.Filters,
		Properties:         finalMerged.Properties,
		SourceBreakdown:    finalMerged.SourceBreakdown,
	}, http.StatusOK)
}
