package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"context"
	"encoding/json"
	"errors"
	"go.mongodb.org/mongo-driver/mongo"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func IsUserRegistered(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if !utils.ValidateEmail(payload.Email) {
		utils.WriteErrorResponse(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	existingUser, err := models.FindUserByEmail(payload.Email)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			utils.Logger.Printf("User %v does not exist", payload.Email)
			utils.WriteSuccessResponse(w, map[string]string{
				"email":            payload.Email,
				"isUserRegistered": "false",
			}, http.StatusOK)
			return
		}
		utils.Logger.Printf("Error finding user by email: %v", err)
		utils.WriteErrorResponse(w, "Server Error while Finding user", http.StatusInternalServerError)
		return
	}

	if existingUser == nil {
		utils.Logger.Printf("User %v does not exist", payload.Email)
		utils.WriteSuccessResponse(w, map[string]string{
			"email":            payload.Email,
			"isUserRegistered": "false",
		}, http.StatusOK)
		return
	}
	utils.WriteSuccessResponse(w, map[string]string{
		"email":            existingUser.Email,
		"name":             existingUser.Name,
		"profilePicture":   existingUser.Picture,
		"isUserRegistered": "true",
	}, http.StatusOK)
}

func GoogleSignIn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		IDToken string `json:"idToken"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if body.IDToken == "" {
		http.Error(w, "ID token is required", http.StatusBadRequest)
		return
	}

	// Verify the Firebase ID token
	token, err := services.FirebaseAuthClient.VerifyIDToken(context.Background(), body.IDToken)
	if err != nil {
		utils.Logger.Printf("Failed to verify Firebase ID token: %v\n", err)
		http.Error(w, "Invalid ID token", http.StatusUnauthorized)
		return
	}

	// Extract user info
	uid := token.UID
	email := token.Claims["email"]
	name := token.Claims["name"]
	profile := token.Claims["picture"]

	utils.Logger.Printf("Verified user: UID=%s, Email=%s, Name=%s\n", uid, email, name)

	existingUser, err := models.FindUserByEmail(email.(string))
	if err != nil {
		utils.Logger.Printf("Error finding user by email: %v", err)
	}

	if existingUser == nil {
		user := models.User{
			Email:        email.(string),
			PasswordHash: utils.GenerateRandomPassword(),
			Role:         "tenant",
			Picture:      profile.(string),
		}
		if err2 := user.Save(); err2 != nil {
			utils.Logger.Printf("Error saving user to database: %v", err2)
			utils.WriteErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	User, err := models.FindUserByEmail(email.(string))
	if err != nil {
		utils.Logger.Printf("Error finding user by email: %v", err)
		utils.WriteErrorResponse(w, "Not able to register User", http.StatusInternalServerError)
	}

	UserId := User.ID

	appToken, err := utils.GenerateJWT(UserId.Hex(), "tenant")
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Respond with token
	resp := map[string]string{
		"token":   appToken,
		"picture": profile.(string),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func Signup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request payload
	var payload struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate input
	if !utils.ValidateEmail(payload.Email) {
		utils.WriteErrorResponse(w, "Invalid email format", http.StatusBadRequest)
		return
	}
	if !utils.ValidatePassword(payload.Password) {
		utils.WriteErrorResponse(w, "Password must be at least 8 characters and include uppercase, lowercase, number and special character", http.StatusBadRequest)
		return
	}

	if len(payload.Name) == 0 {
		utils.WriteErrorResponse(w, "Name is required", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.Logger.Printf("Password hashing failed: %v", err)
		utils.WriteErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Create user model
	user := models.User{
		Email:        payload.Email,
		PasswordHash: string(hashedPassword),
		Name:         payload.Name,
		Role:         "tenant",
		Picture:      "/default-picture",
	}

	// Save user to DB
	if err := user.Save(); err != nil {
		utils.Logger.Printf("Error saving user to database: %v", err)
		utils.WriteErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, map[string]string{"message": "User registered successfully"}, http.StatusCreated)
}

// Login handles user login
func Login(w http.ResponseWriter, r *http.Request) {
	var loginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&loginRequest); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Find user by email
	user, err := models.FindUserByEmail(loginRequest.Email)
	if err != nil {
		utils.WriteErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(loginRequest.Password))
	if err != nil {
		utils.WriteErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT
	token, err := utils.GenerateJWT(user.ID.Hex(), user.Role)
	if err != nil {
		utils.Logger.Printf("JWT generation failed: %v", err)
		utils.WriteErrorResponse(w, "Failed to login", http.StatusInternalServerError)
		return
	}

	utils.WriteSuccessResponse(w, map[string]string{"token": token, "message": "Login successful"}, http.StatusOK)
}

func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	user, err := models.FindUserByID(userID)
	if err != nil {
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}
	utils.WriteSuccessResponse(w, user, http.StatusOK)
}
