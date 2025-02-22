package models

import (
	"backend/services"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Chat struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	SenderID   string             `json:"senderId" bson:"senderId"`
	ReceiverID string             `json:"receiverId" bson:"receiverId"`
	Message    string             `json:"message" bson:"message"`
	Timestamp  time.Time          `json:"timestamp" bson:"timestamp"`
}

func GetChatCollection() *mongo.Collection {
	return services.GetMongoDB().Collection("chats")
}

func SaveMessage(chat *Chat) error {
	collection := GetChatCollection()
	chat.ID = primitive.NewObjectID()
	chat.Timestamp = time.Now()
	_, err := collection.InsertOne(context.Background(), chat)
	return err
}

func GetMessagesByUsers(senderID string, receiverID string) ([]*Chat, error) {
	collection := GetChatCollection()
	query := bson.M{
		"$or": []bson.M{
			{"senderId": senderID, "receiverId": receiverID},
			{"senderId": receiverID, "receiverId": senderID},
		},
	}

	cursor, err := collection.Find(context.Background(), query, &options.FindOptions{Sort: bson.D{{Key: "timestamp", Value: 1}}}) // Sort by timestamp ascending
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var chats []*Chat
	for cursor.Next(context.Background()) {
		var chat Chat
		if err := cursor.Decode(&chat); err != nil {
			return nil, err
		}
		chats = append(chats, &chat)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return chats, nil
}
