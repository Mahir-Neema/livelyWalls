package models

import (
	"backend/services" 
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)


type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Email       string             `bson:"email"`
	PasswordHash string             `bson:"password_hash"` 
	Name        string             `bson:"name"`
	Picture     string             `bson:"picture"`
	Role        string             `bson:"role"`          // e.g., "owner", "tenant", "admin"
	CreatedAt   time.Time          `bson:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt"`
}

func GetUserCollection() *mongo.Collection {
	return services.GetMongoDB().Collection("users") 
}


func FindUserByEmail(email string) (*User, error) {
	collection := GetUserCollection()
	var user User
	err := collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}


func FindUserByID(id string) (*User, error) {
	collection := GetUserCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var user User
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}


func (u *User) Save() error {
	collection := GetUserCollection()
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	u.ID = primitive.NewObjectID() 
	_, err := collection.InsertOne(context.Background(), u)
	return err
}


func UpdateUser(id string, updatedUser *User) error {
	collection := GetUserCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	updatedUser.UpdatedAt = time.Now()
	update := bson.M{
		"$set": updatedUser,
	}
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	return err
}


func DeleteUser(id string) error {
	collection := GetUserCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}