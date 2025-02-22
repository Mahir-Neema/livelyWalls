package controllers

import (
	"backend/models"
	"backend/services"
	"backend/utils"
	"encoding/json"
	"net/http"
	"time"
)

// GetChats retrieves chat messages between two users
func GetChats(w http.ResponseWriter, r *http.Request) {
	senderID := r.Context().Value("userID").(string)
	receiverID := r.URL.Query().Get("receiverId") // Expect receiverId as query param

	if receiverID == "" {
		utils.WriteErrorResponse(w, "Receiver ID is required", http.StatusBadRequest)
		return
	}

	chats, err := models.GetMessagesByUsers(senderID, receiverID)
	if err != nil {
		utils.Logger.Printf("Error fetching chats: %v", err)
		utils.WriteErrorResponse(w, "Failed to fetch chats", http.StatusInternalServerError)
		return
	}
	utils.WriteSuccessResponse(w, chats, http.StatusOK)
}

// SendMessage sends a new chat message
func SendMessage(w http.ResponseWriter, r *http.Request) {
	senderID := r.Context().Value("userID").(string)

	var chatMessage models.Chat
	if err := json.NewDecoder(r.Body).Decode(&chatMessage); err != nil {
		utils.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	chatMessage.SenderID = senderID
	if chatMessage.ReceiverID == "" || chatMessage.Message == "" {
		utils.WriteErrorResponse(w, "Receiver ID and message are required", http.StatusBadRequest)
		return
	}

	err := models.SaveMessage(&chatMessage)
	if err != nil {
		utils.Logger.Printf("Error saving message: %v", err)
		utils.WriteErrorResponse(w, "Failed to send message", http.StatusInternalServerError)
		return
	}

	// Broadcast message using WebSocket
	messageToBroadcast := services.Message{
		Sender:    senderID,
		Receiver:  chatMessage.ReceiverID,
		Message:   chatMessage.Message,
		Timestamp: time.Now().Format(time.RFC3339), // Format timestamp for client
	}
	services.Broadcast <- messageToBroadcast

	utils.WriteSuccessResponse(w, map[string]string{"message": "Message sent successfully"}, http.StatusCreated)
}
