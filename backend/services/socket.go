package services

import (
	"backend/utils"
	"net/http"

	"github.com/gorilla/websocket"
)

var (
	Upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	Clients   = make(map[*websocket.Conn]bool)
	Broadcast = make(chan Message)
)

type Message struct {
	Sender    string `json:"sender"`
	Receiver  string `json:"receiver"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.Logger.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer ws.Close()

	Clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			utils.Logger.Printf("Error reading JSON: %v", err)
			delete(Clients, ws)
			break
		}
		Broadcast <- msg
	}
}

func HandleBroadcasts() {
	for {
		msg := <-Broadcast
		for client := range Clients {
			err := client.WriteJSON(msg)
			if err != nil {
				utils.Logger.Printf("Error broadcasting message: %v", err)
				client.Close()
				delete(Clients, client)
			}
		}
	}
}
