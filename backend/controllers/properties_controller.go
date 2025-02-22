package controllers

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// GetProperties retrieves all properties
func GetProperties(w http.ResponseWriter, r *http.Request) {
	properties, err := models.GetAllProperties()
	if err != nil {
		utils.Logger.Printf("Error fetching properties: %v", err) // Correct: Printf is a standard method
		utils.WriteErrorResponse(w, "Failed to fetch properties", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, properties, http.StatusOK)
}

// GetPropertyByID retrieves a property by its ID
func GetPropertyByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	propertyID := params["id"]

	property, err := models.GetPropertyByID(propertyID)
	if err != nil {
		utils.Logger.Printf("Property not found: %v, error: %v", propertyID, err) // Correct: Printf is a standard method
		utils.WriteErrorResponse(w, "Property not found", http.StatusNotFound)
		return
	}
	utils.WriteSuccessResponse(w, property, http.StatusOK)
}

// AddProperty adds a new property
func AddProperty(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string) // Get userID from context

	var property models.Property
	if err := json.NewDecoder(r.Body).Decode(&property); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate input
	if property.PropertyType == "" || !utils.IsValidPropertyType(property.PropertyType) {
		utils.WriteErrorResponse(w, "Invalid property type", http.StatusBadRequest)
		return
	}
	if property.ListingType == "" || !utils.IsValidListingType(property.ListingType) {
		utils.WriteErrorResponse(w, "Invalid listing type", http.StatusBadRequest)
		return
	}
	if property.City == "" || property.Area == "" {
		utils.WriteErrorResponse(w, "Address details are incomplete", http.StatusBadRequest)
		return
	}
	if property.Rent < 0 {
		utils.WriteErrorResponse(w, "Rent cannot be negative", http.StatusBadRequest)
		return
	}

	property.OwnerID = userID // Set owner ID from authenticated user
	err := models.AddProperty(&property)
	if err != nil {
		utils.Logger.Printf("Failed to add property to database: %v", err)
		utils.WriteErrorResponse(w, "Failed to add property", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, map[string]string{"message": "Property added successfully"}, http.StatusCreated)
}

// UpdateProperty updates an existing property
func UpdateProperty(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string) // Get userID from context
	params := mux.Vars(r)
	propertyID := params["id"]

	var updatedProperty models.Property
	if err := json.NewDecoder(r.Body).Decode(&updatedProperty); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Authorization: Check if the user is the owner of the property
	property, err := models.GetPropertyByID(propertyID)
	if err != nil {
		utils.WriteErrorResponse(w, "Property not found", http.StatusNotFound)
		return
	}
	if property.OwnerID != userID {
		utils.WriteErrorResponse(w, "Unauthorized to update this property", http.StatusForbidden)
		return
	}

	err = models.UpdateProperty(propertyID, &updatedProperty)
	if err != nil {
		utils.Logger.Printf("Failed to update property in database: %v", err)
		utils.WriteErrorResponse(w, "Failed to update property", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, map[string]string{"message": "Property updated successfully"}, http.StatusOK)
}

// DeleteProperty deletes a property by its ID
func DeleteProperty(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string) // Get userID from context
	params := mux.Vars(r)
	propertyID := params["id"]

	// Authorization: Check if the user is the owner of the property
	property, err := models.GetPropertyByID(propertyID)
	if err != nil {
		utils.WriteErrorResponse(w, "Property not found", http.StatusNotFound)
		return
	}
	if property.OwnerID != userID {
		utils.WriteErrorResponse(w, "Unauthorized to delete this property", http.StatusForbidden)
		return
	}

	err = models.DeleteProperty(propertyID)
	if err != nil {
		utils.Logger.Printf("Failed to delete property from database: %v", err)
		utils.WriteErrorResponse(w, "Failed to delete property", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, map[string]string{"message": "Property deleted successfully"}, http.StatusOK)
}
