package controllers

import (
	"backend/services"
	"backend/utils"
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
