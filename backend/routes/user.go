package routes

import (
	"backend/controllers"
	"github.com/gorilla/mux"
)

func RegisterUserRoutes(r *mux.Router) {
	userRouter := r.PathPrefix("/profile").Subrouter()
	userRouter.HandleFunc("", controllers.GetUserProfile).Methods("GET")
	userRouter.HandleFunc("/update", controllers.UpdateUserProfile).Methods("POST")
}
