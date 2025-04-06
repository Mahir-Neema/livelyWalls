package controllers

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"
)

func GetReviews(w http.ResponseWriter, r *http.Request) {
	// limit := r.URL.Query().Get("limit")
	limit := 3
	properties, err := models.GetTopReviews(limit)
	if err != nil {
		utils.Logger.Printf("Error fetching reviews: %v", err)
		utils.WriteErrorResponse(w, "Failed to fetch reviews", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, properties, http.StatusOK)
}

func AddReview(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)

	var review models.Review
	if err := json.NewDecoder(r.Body).Decode(&review); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if review.Rating < 1 || review.Rating > 5 {	
		utils.WriteErrorResponse(w, "Rating must be between 1 and 5", http.StatusBadRequest)
		return
	}

	review.UserID = userID

	if err := models.AddReview(&review); err != nil {
		utils.Logger.Printf("Error adding review: %v", err)
		utils.WriteErrorResponse(w, "Failed to add review", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, "Review added successfully", http.StatusCreated)
}
