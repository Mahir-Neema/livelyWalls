package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gorilla/mux"
)

func RegisterSearchRoutes(r *mux.Router) {
	searchRouter := r.PathPrefix("/search").Subrouter()
	searchRouter.Use(middlewares.AuthMiddleware)
	searchRouter.HandleFunc("/", controllers.SearchProperties).Methods("POST", "GET") // POST for complex filters in body, GET for simple query params
	searchRouter.HandleFunc("/popular-places", controllers.GetPopularPlaces).Methods("GET")
	searchRouter.HandleFunc("/place-stats", controllers.GetPlaceSearchStats).Methods("GET")
}
