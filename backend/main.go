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
)

func main() {

	config.LoadEnv()

	utils.InitializeLogger()

	config.ConnectDB()

	router := mux.NewRouter()

	routes.RegisterRoutes(router)

	router.HandleFunc("/ws", services.HandleConnections)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}
	utils.Logger.Println("Server starting on port : ", port) 


	// router.PathPrefix("/").Handler(http.FileServer(http.Dir("./frontend/build")))

	log.Fatal(http.ListenAndServe(":"+port, router))
}
