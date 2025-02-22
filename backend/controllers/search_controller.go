package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

func SearchProperties(w http.ResponseWriter, r *http.Request) {
	var filters map[string]interface{} // Allow flexible filtering
	if err := json.NewDecoder(r.Body).Decode(&filters); err != nil {
		utils.WriteErrorResponse(w, "Invalid filter parameters", http.StatusBadRequest)
		return
	}

	// Extract city from filters (if present) to track popular places
	if city, ok := filters["city"].(string); ok && city != "" {
		ctx := r.Context()
		err := services.IncrementSearchedPlaceCount(ctx, city) // Increment search count for the city
		if err != nil {
			utils.Logger.Printf("Error incrementing searched place count in Redis: %v", err) // Non-critical, log error but continue search
		}
	}

	// ... (Rest of the SearchProperties logic - caching, DB query, etc. remains mostly the same)
	// ... (Existing caching logic - cacheKey, Redis Get, DB Search, Redis Set)

	properties, err := models.SearchProperties(filters)
	if err != nil {
		utils.Logger.Printf("Error searching properties in database: %v", err)
		utils.WriteErrorResponse(w, "Failed to search properties", http.StatusInternalServerError)
		return
	}

	// ... (Existing caching logic to store properties in Redis - remains the same)

	utils.WriteSuccessResponse(w, properties, http.StatusOK)
}

// GetPopularPlaces retrieves the top N most searched cities.
func GetPopularPlaces(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit") // Get limit from query parameter (e.g., ?limit=5)
	limit := 5                             // Default limit if not provided or invalid
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	ctx := r.Context()
	topPlaces, err := services.GetTopSearchedPlaces(ctx, limit)
	if err != nil {
		utils.Logger.Printf("Error getting top searched places from Redis: %v", err)
		utils.WriteErrorResponse(w, "Failed to retrieve popular places", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, topPlaces, http.StatusOK)
}

// Get rank and score for a specific place
func GetPlaceSearchStats(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	if city == "" {
		utils.WriteErrorResponse(w, "City parameter is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	rank, err := services.GetSearchedPlaceRank(ctx, city)
	if err != nil {
		utils.Logger.Printf("Error getting rank for %s from Redis: %v", city, err)
		utils.WriteErrorResponse(w, "Failed to retrieve place rank", http.StatusInternalServerError)
		return
	}

	score, err := services.GetSearchedPlaceScore(ctx, city)
	if err != nil {
		utils.Logger.Printf("Error getting score for %s from Redis: %v", city, err)
		utils.WriteErrorResponse(w, "Failed to retrieve place score", http.StatusInternalServerError)
		return
	}

	stats := map[string]interface{}{
		"city":  city,
		"rank":  rank,
		"score": score,
	}
	utils.WriteSuccessResponse(w, stats, http.StatusOK)
}
