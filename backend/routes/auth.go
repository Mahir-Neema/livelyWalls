package routes

import (
	"backend/controllers"

	"github.com/gorilla/mux"
)


func RegisterAuthRoutes(r *mux.Router) {
	authRouter := r.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/google", controllers.GoogleSignIn).Methods("POST") // Placeholder
	authRouter.HandleFunc("/signup", controllers.Signup).Methods("POST")
	authRouter.HandleFunc("/login", controllers.Login).Methods("POST")
}
