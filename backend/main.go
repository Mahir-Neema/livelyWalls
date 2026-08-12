package main

import (
	"backend/config"
	"backend/routes"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {

	config.LoadEnv()

	utils.InitializeLogger()

	config.ConnectDB()

	services.InitFirebase()

	utils.InitS3()

	router := mux.NewRouter()

	routes.RegisterRoutes(router)
	router.HandleFunc("/ws", services.HandleConnections)
	router.HandleFunc("/ai-debug", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		env := map[string]interface{}{
			"OPENAI_API_KEY_set":       os.Getenv("OPENAI_API_KEY") != "",
			"OPENAI_API_KEY_len":       len(os.Getenv("OPENAI_API_KEY")),
			"OPENAI_BASE_URL":          os.Getenv("OPENAI_BASE_URL"),
			"OPENAI_PROPERTY_CHAT_MODEL": os.Getenv("OPENAI_PROPERTY_CHAT_MODEL"),
			"REDIS_ADDR_set":           os.Getenv("REDIS_ADDR") != "",
			"MONGO_URI_set":            os.Getenv("MONGO_URI") != "",
		}
		json.NewEncoder(w).Encode(env)
	})

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
