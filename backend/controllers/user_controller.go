package controllers

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"net/http"
	"path/filepath"
	"time"
)

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	user, err := models.FindUserByID(userID)
	if err != nil {
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	user.PasswordHash = ""

	utils.WriteSuccessResponse(w, user, http.StatusOK)
}

func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		utils.WriteErrorResponse(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")

	file, fileHeader, err := r.FormFile("profilePicture")
	var pictureURL string
	if err == nil {
		defer file.Close()

		fileName := fmt.Sprintf("/profile_picture/user_%s/%s%s", userID, time.Now().Format("20060102150405"), filepath.Ext(fileHeader.Filename))
		pictureURL, err = utils.UploadFileToS3(file, fileHeader, fileName, userID)
		if err != nil {
			utils.Logger.Printf("Failed to upload file to Supabase: %v", err)
			utils.WriteErrorResponse(w, "Failed to upload image", http.StatusInternalServerError)
			return
		}
	}

	user, err := models.FindUserByID(userID)
	if err != nil {
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	if name != "" {
		user.Name = name
	}
	if pictureURL != "" {
		user.Picture = pictureURL
	}

	err = models.UpdateUser(userID, user)
	if err != nil {
		utils.WriteErrorResponse(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	user.PasswordHash = ""

	utils.WriteSuccessResponse(w, map[string]interface{}{
		"message": "Profile updated successfully",
		"user": map[string]interface{}{
			"id":      user.ID.Hex(),
			"email":   user.Email,
			"name":    user.Name,
			"role":    user.Role,
			"picture": user.Picture,
		},
	}, http.StatusOK)
}
