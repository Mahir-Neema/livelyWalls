package controllers

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// GoogleSignIn - Placeholder, needs Clerk integration or actual Google OAuth logic
func GoogleSignIn(w http.ResponseWriter, r *http.Request) {

}

// Signup handles user registration
func Signup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request payload
	var payload struct {
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

	// Check if user already exists
	existingUser, err := models.FindUserByEmail(payload.Email)
	if err != nil {
		utils.Logger.Printf("Error finding user by email: %v", err)
		utils.WriteErrorResponse(w, "Internal server error", http.StatusInternalServerError)
	}
	if existingUser != nil {
		utils.WriteErrorResponse(w, "Email already registered", http.StatusConflict)
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
		Role:         "tenant",           // Default role
		Picture:      "/default-picture", // Default profile picture
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

// GetCurrentUser retrieves the current user's profile
func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string) // Get userID from context set by AuthMiddleware
	user, err := models.FindUserByID(userID)
	if err != nil {
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}
	utils.WriteSuccessResponse(w, user, http.StatusOK) // Return user profile data
}
