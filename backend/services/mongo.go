package services

import (
	"backend/utils"
	"context"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoDB *mongo.Database

func ConnectMongo() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		utils.Logger.Fatal("MONGO_URI environment variable not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		utils.Logger.Fatalf("MongoDB connection failed: %v", err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		utils.Logger.Fatalf("MongoDB ping failed: %v", err)
	}

	MongoDB = client.Database(os.Getenv("MONGO_DB_NAME"))
	utils.Logger.Infof("Connected to MongoDB!")
}

func GetMongoDB() *mongo.Database {
	return MongoDB
}
