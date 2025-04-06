package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gorilla/mux"
)

func RegisterReviewRoutes(r *mux.Router) {
	reviewRouter := r.PathPrefix("/review").Subrouter()
	reviewPropertyRouter := reviewRouter.PathPrefix("").Subrouter()
	reviewPropertyRouter.Use(middlewares.AuthMiddleware)

	r.HandleFunc("/add", controllers.AddReview).Methods("POST")
}
