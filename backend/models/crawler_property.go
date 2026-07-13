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

type CrawlerProperty struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title               string             `bson:"title" json:"title"`
	Description         string             `bson:"description" json:"description"`
	Location            string             `bson:"location" json:"location"`
	Rent                int                `bson:"rent" json:"rent"`
	BHK                 int                `bson:"bhk" json:"bhk"`
	Type                string             `bson:"type" json:"type"`
	Furnishing          string             `bson:"furnishing" json:"furnishing"`
	GenderPreference    string             `bson:"genderPreference" json:"genderPreference"`
	VegetarianPreferred bool               `bson:"vegetarianPreferred" json:"vegetarianPreferred"`
	IsBrokerage         bool               `bson:"isBrokerage" json:"isBrokerage"`
	IsActive            bool               `bson:"isActive" json:"isActive"`
	Amenities           []string           `bson:"amenities" json:"amenities"`
	Images              []string           `bson:"images" json:"images"`
	Deposit             int                `bson:"deposit" json:"deposit"`
	Source              string             `bson:"source" json:"source"`
	SourceID            string             `bson:"sourceId" json:"sourceId"`
	SourceURL           string             `bson:"sourceUrl" json:"sourceUrl"`
	CrawledAt           time.Time          `bson:"crawledAt" json:"crawledAt"`
	CreatedAt           time.Time          `bson:"createdAt" json:"createdAt"`
}

func GetCrawlerPropertyCollection() *mongo.Collection {
	return services.GetMongoDB().Collection("propertycrawler")
}

func SearchCrawlerProperties(filters map[string]interface{}, limit int64) ([]*CrawlerProperty, error) {
	collection := GetCrawlerPropertyCollection()
	ctx := context.Background()

	if limit <= 0 {
		limit = 10
	}

	matchStage := bson.M{}

	if location, ok := filters["location"].(string); ok && location != "" {
		matchStage["$or"] = []bson.M{
			{"location": bson.M{"$regex": primitive.Regex{Pattern: location, Options: "i"}}},
			{"title": bson.M{"$regex": primitive.Regex{Pattern: location, Options: "i"}}},
		}
	}

	if minRent, ok := filters["minRent"].(float64); ok {
		matchStage["rent"] = bson.M{"$gte": minRent}
	}
	if maxRent, ok := filters["maxRent"].(float64); ok {
		if _, exists := matchStage["rent"]; exists {
			matchStage["rent"].(bson.M)["$lte"] = maxRent
		} else {
			matchStage["rent"] = bson.M{"$lte": maxRent}
		}
	}

	if bedrooms, ok := filters["bedrooms"].(int); ok && bedrooms > 0 {
		matchStage["bhk"] = bedrooms
	} else if bedrooms, ok := filters["bedrooms"].(float64); ok && bedrooms > 0 {
		matchStage["bhk"] = int(bedrooms)
	}

	if isAvailable, ok := filters["isAvailable"].(bool); ok && isAvailable {
		matchStage["isActive"] = true
	}

	if isBrokerListing, ok := filters["isBrokerListing"].(bool); ok {
		if isBrokerListing {
			matchStage["isBrokerage"] = true
		} else {
			matchStage["isBrokerage"] = bson.M{"$ne": true}
		}
	}

	if isVegetarianPreferred, ok := filters["isVegetarianPreferred"].(bool); ok {
		matchStage["vegetarianPreferred"] = isVegetarianPreferred
	}

	if genderPreference, ok := filters["genderPreference"].(string); ok && genderPreference != "" {
		matchStage["genderPreference"] = bson.M{
			"$regex": primitive.Regex{Pattern: genderPreference, Options: "i"},
		}
	}

	if furnishing, ok := filters["furnishing"].(string); ok && furnishing != "" {
		matchStage["furnishing"] = bson.M{
			"$regex": primitive.Regex{Pattern: furnishing, Options: "i"},
		}
	}

	findOptions := options.Find().
		SetSort(bson.M{"crawledAt": -1}).
		SetLimit(limit)

	cursor, err := collection.Find(ctx, matchStage, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var properties []*CrawlerProperty
	for cursor.Next(ctx) {
		var property CrawlerProperty
		if err := cursor.Decode(&property); err != nil {
			return nil, err
		}
		properties = append(properties, &property)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return properties, nil
}
