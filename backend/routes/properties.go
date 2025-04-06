package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gorilla/mux"
)

func RegisterPropertyRoutes(r *mux.Router) {
	propertyRouter := r.PathPrefix("/properties").Subrouter()

	// Public routes - No authentication required for viewing properties (GET requests)
	// propertyRouter.HandleFunc("/", controllers.GetProperties).Methods("GET")
	// propertyRouter.HandleFunc("/{id}", controllers.GetPropertyByID).Methods("GET")

	// Protected routes - Authentication required for adding, updating, deleting (POST, PUT, DELETE)
	protectedPropertyRouter := propertyRouter.PathPrefix("").Subrouter() // Same path prefix "/properties"
	protectedPropertyRouter.Use(middlewares.AuthMiddleware)              // AuthMiddleware to this subrouter only

	protectedPropertyRouter.HandleFunc("/", controllers.AddProperty).Methods("POST")
	protectedPropertyRouter.HandleFunc("/{id}", controllers.UpdateProperty).Methods("PUT")
	protectedPropertyRouter.HandleFunc("/{id}", controllers.DeleteProperty).Methods("DELETE")
	protectedPropertyRouter.HandleFunc("/uploadfile", controllers.UploadFile).Methods("POST")
}
