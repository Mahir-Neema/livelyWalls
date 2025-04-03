package main

import (
	"backend/config"
	"backend/routes"
	"backend/services"
	"backend/utils"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
)

func main() {

	config.LoadEnv()
	
	utils.InitializeLogger()
	
	config.ConnectDB()

	router := mux.NewRouter()

	routes.RegisterRoutes(router)
	router.HandleFunc("/ws", services.HandleConnections)

	allowedURI := os.Getenv("ALLOWED_URL")
	if allowedURI == "" {
		utils.Logger.Printf("ALLOWED_URL environment variable not set")
	}

	corsAllowedOrigins := []string{"http://localhost:3000", allowedURI}
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins(corsAllowedOrigins),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	utils.Logger.Println("Server starting on port: ", port)

	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
