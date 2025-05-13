package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
)

// GetProperties retrieves all properties
func GetProperties(w http.ResponseWriter, r *http.Request) {
	properties, err := models.GetAllProperties()
	if err != nil {
		utils.Logger.Printf("Error fetching properties: %v", err)
		utils.WriteErrorResponse(w, "Failed to fetch properties", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, properties, http.StatusOK)
}

// GetTopProperties retrieves the top properties based on views
func GetTopProperties(w http.ResponseWriter, r *http.Request) {
	limit := 8
	properties, err := models.GetTopProperties(limit)
	if err != nil {
		utils.Logger.Printf("Error fetching top properties: %v", err)
		utils.WriteErrorResponse(w, "Failed to fetch top properties", http.StatusInternalServerError)
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
	if userID == "" {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		utils.WriteErrorResponse(w, "File too large (max 10MB)", http.StatusBadRequest)
		return
	}

	jsonData := r.FormValue("property")
	if jsonData == "" {
		utils.WriteErrorResponse(w, "Missing property data", http.StatusBadRequest)
		return
	}

	// utils.Logger.Printf("Received property data: %s", jsonData)

	// Decode JSON
	var property models.Property
	if err := json.Unmarshal([]byte(jsonData), &property); err != nil {
		utils.WriteErrorResponse(w, "Invalid property JSON", http.StatusBadRequest)
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
	if property.Rent <= 0 {
		utils.WriteErrorResponse(w, "Rent cannot be negative", http.StatusBadRequest)
		return
	}
	if property.Bedrooms < 0 || property.Bathrooms < 0 {
		utils.WriteErrorResponse(w, "Bedrooms and bathrooms cannot be negative", http.StatusBadRequest)
		return
	}
	if property.Location == "" {
		utils.WriteErrorResponse(w, "Location cannot be empty", http.StatusBadRequest)
		return
	}

	if property.CreatedAt.IsZero() {
		property.CreatedAt = time.Now()
	}
	if property.Views == 0 {
		property.Views = 0
	}

	// file uploads
	files := r.MultipartForm.File["photoFiles"]
	if len(files) > 8 {
		utils.Logger.Printf("More than 8 files were uploaded")
		utils.WriteErrorResponse(w, "Too many files, max 8 photos can be uploaded", http.StatusBadRequest)
		return
	}
	var photoURLs []string

	if len(files) != 0 {
		for _, fileHeader := range files {
			file, err2 := fileHeader.Open()
			if err2 != nil {
				utils.WriteErrorResponse(w, "Failed to process file", http.StatusInternalServerError)
				return
			}
			defer file.Close()

			fileName := fmt.Sprintf("/properties/user_%s/%s%s", userID, time.Now().Format("20060102150405"), filepath.Ext(fileHeader.Filename))
			url, err3 := utils.UploadFileToS3(file, fileHeader, fileName, userID)
			if err3 != nil {
				utils.Logger.Printf("Failed to upload file to Supabase: %v", err3)
				utils.WriteErrorResponse(w, "Failed to upload image", http.StatusInternalServerError)
				return
			}
			photoURLs = append(photoURLs, url)
		}
	}

	property.Photos = photoURLs
	property.OwnerID = userID

	err2 := models.AddProperty(&property)
	if err2 != nil {
		utils.Logger.Printf("Failed to add property to database: %v", err2)
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

// temporary function to upload files
func UploadFile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string) // Get userID from context

	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		utils.WriteErrorResponse(w, "File too large (max 10MB)", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["photos"]
	if len(files) == 0 {
		utils.WriteErrorResponse(w, "No files uploaded", http.StatusBadRequest)
		return
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			utils.WriteErrorResponse(w, "Failed to process file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		fileName := fmt.Sprintf("/properties/user_%s/%s%s", userID, time.Now().Format("20060102150405"), filepath.Ext(fileHeader.Filename))
		url, err := utils.UploadFileToS3(file, fileHeader, fileName, userID)
		if err != nil {
			utils.Logger.Printf("Failed to upload file to Supabase: %v", err)
			utils.WriteErrorResponse(w, "Failed to upload image", http.StatusInternalServerError)
			return
		}
		utils.Logger.Printf("File uploaded to Supabase: %s", url)
	}

	utils.WriteSuccessResponse(w, map[string]string{"message": "Files uploaded successfully"}, http.StatusOK)
}

func UpdatePropertyViews(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	propertyID := params["id"]
	if propertyID == "" {
		utils.WriteErrorResponse(w, "Property ID is required", http.StatusBadRequest)
		return
	}
	utils.Logger.Printf("Incrementing views for property ID: %s", propertyID)

	go services.IncrementPropertyView(propertyID) // async call to avoid blocking

	utils.WriteSuccessResponse(w, map[string]string{
		"message": "View recorded successfully",
	}, http.StatusOK)
}
