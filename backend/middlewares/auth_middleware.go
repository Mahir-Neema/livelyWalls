package middlewares

import (
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

		claims, err := utils.ValidateJWT(token)
		if err != nil {
			utils.WriteErrorResponse(w, "Invalid or Expired Token", http.StatusUnauthorized)
			return
		}

		userID := claims["userID"].(string)
		role := claims["role"].(string)

		// Add userID and role to the context
		ctx := context.WithValue(r.Context(), "userID", userID)
		ctx = context.WithValue(ctx, "userRole", role) // Add role to context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
