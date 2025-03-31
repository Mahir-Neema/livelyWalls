package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gorilla/mux"
)

// RegisterRoutes aggregates all the route registrations into a single function.
func RegisterRoutes(r *mux.Router) {
	RegisterAuthRoutes(r)
	RegisterSearchRoutes(r)

	// Public Property Routes - REGISTER THESE DIRECTLY ON THE MAIN ROUTER 'r'
	r.HandleFunc("/api/properties", controllers.GetProperties).Methods("GET")
	r.HandleFunc("/api/properties/top", controllers.GetTopProperties).Methods("GET")
	r.HandleFunc("/api/properties/{id}", controllers.GetPropertyByID).Methods("GET")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middlewares.AuthMiddleware)

	RegisterPropertyRoutes(api)
	RegisterChatRoutes(api)

	// adminAPI := api.PathPrefix("/admin").Subrouter()
	// adminAPI.Use(middlewares.RoleMiddleware([]string{"admin"}))
	// RegisterAdminRoutes(adminAPI)
}
