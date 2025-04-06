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

type Review struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `json:"userId"`
	Rating    int                `json:"rating"`
	Comment   string             `json:"comment"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

func GetReviewCollection() *mongo.Collection {
	return services.GetMongoDB().Collection("reviews")
}

func GetTopReviews(limit int) ([]*Review, error) {
	collection := GetPropertyCollection()

	cursor, err := collection.Find(
		context.Background(),
		bson.M{},
		options.Find().SetSort(bson.M{"rating": -1}).SetLimit(int64(limit)),
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var Reviews []*Review
	for cursor.Next(context.Background()) {
		var review Review
		if err := cursor.Decode(&review); err != nil {
			return nil, err
		}
		Reviews = append(Reviews, &review)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return Reviews, nil
}

func AddReview(review *Review) error {
	collection := GetPropertyCollection()
	review.ID = primitive.NewObjectID()
	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()
	_, err := collection.InsertOne(context.Background(), review)
	return err
}
