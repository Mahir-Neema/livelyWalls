package middlewares

import (
	"backend/models"
	"backend/utils"
	"context"
	"net/http"
	"strings"
)

// AuthMiddleware validates JWT, fetches user role and adds userID and role to the request context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteErrorResponse(w, "Missing Authorization Header", http.StatusUnauthorized)
			return
		}

		// Extract token
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			utils.WriteErrorResponse(w, "Invalid Token Format", http.StatusUnauthorized)
			return
		}

		// Validate token and extract userID and role
		claims, err := utils.ValidateJWT(token)
		if err != nil {
			utils.WriteErrorResponse(w, "Invalid or Expired Token", http.StatusUnauthorized)
			return
		}

		userID := claims["userID"].(string) // Assuming userID is string in JWT claims
		role := claims["role"].(string)     // Assuming role is in JWT claims

		// Verify user exists (optional, but good for security) - can be removed for perf in high load scenarios if user existence is guaranteed by auth flow
		user, err := models.FindUserByID(userID)
		if err != nil || user == nil {
			utils.WriteErrorResponse(w, "Invalid User from Token", http.StatusUnauthorized)
			return
		}

		// Add userID and role to the context
		ctx := context.WithValue(r.Context(), "userID", userID)
		ctx = context.WithValue(ctx, "userRole", role) // Add role to context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
