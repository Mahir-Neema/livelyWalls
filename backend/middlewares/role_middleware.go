package middlewares

import (
	"backend/utils"
	"net/http"
)

func RoleMiddleware(allowedRoles []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole, ok := r.Context().Value("userRole").(string) // Get userRole from context set by AuthMiddleware
			if !ok {
				utils.WriteErrorResponse(w, "User role not found in context", http.StatusInternalServerError) // Should not happen if AuthMiddleware is correctly applied before
				return
			}

			isAllowed := false
			for _, role := range allowedRoles {
				if userRole == role {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				utils.WriteErrorResponse(w, "Forbidden - Insufficient Role", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}