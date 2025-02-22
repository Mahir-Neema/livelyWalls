package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gorilla/mux"
)

// RegisterRoutes aggregates all the route registrations into a single function.
func RegisterRoutes(r *mux.Router) {
	RegisterAuthRoutes(r)

	// Public Property Routes - REGISTER THESE DIRECTLY ON THE MAIN ROUTER 'r'
	r.HandleFunc("/api/properties", controllers.GetProperties).Methods("GET")        // Public GET /api/properties
	r.HandleFunc("/api/properties/{id}", controllers.GetPropertyByID).Methods("GET") // Public GET /api/properties/{id}

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middlewares.AuthMiddleware) // Apply AuthMiddleware to /api prefix

	RegisterPropertyRoutes(api) // Under /api/properties
	RegisterSearchRoutes(api)   // Under /api/search
	RegisterChatRoutes(api)     // Under /api/chats
	// Example of Role-Based route (Admin only can access admin routes under /api/admin prefix if you create admin controllers/routes)
	// adminAPI := api.PathPrefix("/admin").Subrouter()
	// adminAPI.Use(middlewares.RoleMiddleware([]string{"admin"})) // Example: Admin role required
	// RegisterAdminRoutes(adminAPI)
}
