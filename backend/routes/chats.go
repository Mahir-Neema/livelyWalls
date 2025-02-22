package routes

import (
	"backend/controllers"
	"backend/middlewares"
	"backend/services"

	"github.com/gorilla/mux"
)

func RegisterChatRoutes(r *mux.Router) {
	chatRouter := r.PathPrefix("/chats").Subrouter()
	chatRouter.Use(middlewares.AuthMiddleware)
	chatRouter.HandleFunc("/", controllers.GetChats).Methods("GET")
	chatRouter.HandleFunc("/send", controllers.SendMessage).Methods("POST")
	chatRouter.HandleFunc("/ws", services.HandleConnections) // WebSocket endpoint
}
