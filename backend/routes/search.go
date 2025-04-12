package routes

import (
	"backend/controllers"

	"github.com/gorilla/mux"
)

func RegisterSearchRoutes(r *mux.Router) {
	searchRouter := r.PathPrefix("/search").Subrouter()
	// searchRouter.Use(middlewares.AuthMiddleware)
	searchRouter.HandleFunc("", controllers.SearchProperties).Methods("POST", "GET")
	searchRouter.HandleFunc("/popular-places", controllers.GetPopularPlaces).Methods("GET")
}
