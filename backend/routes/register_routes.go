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
	RegisterViewsRoutes(r)

	// Public Property Routes - REGISTER THESE DIRECTLY ON THE MAIN ROUTER 'r'
	r.HandleFunc("/api/properties", controllers.GetProperties).Methods("GET")
	r.HandleFunc("/api/properties/top", controllers.GetTopProperties).Methods("GET")
	r.HandleFunc("/api/properties/{id}", controllers.GetPropertyByID).Methods("GET")
	r.HandleFunc("/api/reviews", controllers.GetReviews).Methods("GET")
	r.HandleFunc("/api/properties/{id}/view", controllers.UpdatePropertyViews).Methods("POST")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middlewares.AuthMiddleware)

	RegisterReviewRoutes(api)
	RegisterPropertyRoutes(api)
	RegisterChatRoutes(api)

	// adminAPI := api.PathPrefix("/admin").Subrouter()
	// adminAPI.Use(middlewares.RoleMiddleware([]string{"admin"}))
	// RegisterAdminRoutes(adminAPI)
}
