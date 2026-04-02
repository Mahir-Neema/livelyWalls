package routes

import (
	"backend/controllers"

	"github.com/gorilla/mux"
)

func RegisterAIRoutes(r *mux.Router) {
	aiRouter := r.PathPrefix("/ai").Subrouter()
	aiRouter.HandleFunc("/nearby-locations", controllers.GetNearbyLocations).Methods("GET")
}
