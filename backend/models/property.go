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

type Property struct {
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID               string             `json:"owner_id" bson:"owner_id"`
	IsOwnerListing        bool               `json:"isOwnerListing" bson:"isOwnerListing"`
	IsBrokerListing       bool               `json:"isBrokerListing" bson:"isBrokerListing"`
	IsAvailable           bool               `json:"isAvailable" bson:"isAvailable"`
	IsVegetarianPreferred bool               `json:"isVegetarianPreferred" bson:"isVegetarianPreferred"`
	IsFamilyPreferred     bool               `json:"isFamilyPreferred" bson:"isFamilyPreferred"`
	GenderPreference      string             `json:"genderPreference" bson:"genderPreference"` // Male, Female, Any
	PropertyType          string             `json:"propertyType" bson:"propertyType"`         // "Flat", "Apartment", "House", "Studio"
	ListingType           string             `json:"listingType" bson:"listingType"`           // "Rent", "Sale"
	Location              string             `json:"location" bson:"location"`                 // e.g., "Bangalore", "Delhi"
	SocietyName           string             `json:"societyName" bson:"societyName"`
	StreetAddress         string             `json:"streetAddress" bson:"streetAddress"`
	Area                  string             `json:"area" bson:"area"`
	City                  string             `json:"city" bson:"city"`
	State                 string             `json:"state" bson:"state"`
	ZipCode               string             `json:"zipCode" bson:"zipCode"`
	Bedrooms              int                `json:"bedrooms" bson:"bedrooms"`
	Bathrooms             int                `json:"bathrooms" bson:"bathrooms"`
	AreaSqft              float64            `json:"areaSqft" bson:"areaSqft"`
	Balconies             int                `json:"balconies" bson:"balconies"`
	Amenities             []string           `json:"amenities" bson:"amenities"`
	Description           string             `json:"description" bson:"description"`
	Rent                  float64            `json:"rent" bson:"rent"`
	SecurityDeposit       float64            `json:"securityDeposit" bson:"securityDeposit"`
	MaintenanceCharges    float64            `json:"maintenanceCharges" bson:"maintenanceCharges"`
	LeaseTerm             string             `json:"leaseTerm" bson:"leaseTerm"`
	Photos                []string           `json:"photos" bson:"photos"`
	Latitude              float64            `json:"latitude" bson:"latitude"`
	Longitude             float64            `json:"longitude" bson:"longitude"`
	DistancesFromOffices  map[string]float64 `json:"distancesFromOffices" bson:"distancesFromOffices"` // e.g., {"flipkart": 1.5, "google": 2.0}
	CreatedAt             time.Time          `bson:"createdAt"`
	UpdatedAt             time.Time          `bson:"updatedAt"`
	Views                 int                `json:"views" bson:"views"`
	Link                  string             `json:"link" bson:"link"`
}

func GetPropertyCollection() *mongo.Collection {
	return services.GetMongoDB().Collection("properties")
}

func GetAllProperties() ([]*Property, error) {
	collection := GetPropertyCollection()
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var properties []*Property
	for cursor.Next(context.Background()) {
		var property Property
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

// GetTopProperties retrieves the top properties based on the number of views
func GetTopProperties(limit int) ([]*Property, error) {
	collection := GetPropertyCollection()

	// Query to find properties sorted by views in descending order
	cursor, err := collection.Find(
		context.Background(),
		bson.M{}, // Empty filter to match all properties
		options.Find().SetSort(bson.M{"views": -1}).SetLimit(int64(limit)), // Sort by 'views' descending and limit the number of results
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var properties []*Property
	for cursor.Next(context.Background()) {
		var property Property
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

func GetPropertyByID(id string) (*Property, error) {
	collection := GetPropertyCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var property Property
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&property)
	if err != nil {
		return nil, err
	}
	return &property, nil
}

func AddProperty(property *Property) error {
	collection := GetPropertyCollection()
	property.ID = primitive.NewObjectID() // Generate ObjectID on add
	property.CreatedAt = time.Now()
	property.UpdatedAt = time.Now()
	_, err := collection.InsertOne(context.Background(), property)
	return err
}

func UpdateProperty(id string, updatedProperty *Property) error {
	collection := GetPropertyCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	updatedProperty.UpdatedAt = time.Now()
	update := bson.M{
		"$set": updatedProperty,
	}
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	return err
}

func DeleteProperty(id string) error {
	collection := GetPropertyCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// SearchProperties performs a search on properties based on filters
func SearchProperties(filters map[string]interface{}) ([]*Property, error) {
	collection := GetPropertyCollection()
	query := bson.M{}

	// Filters
	if city, ok := filters["city"].(string); ok && city != "" {
		query["city"] = bson.M{"$regex": primitive.Regex{Pattern: city, Options: "i"}} // Case-insensitive search
	}

	// location filter
	if location, ok := filters["location"].(string); ok && location != "" {
		query["location"] = bson.M{"$regex": primitive.Regex{Pattern: location, Options: "i"}} // Case-insensitive search
	}

	if propertyType, ok := filters["propertyType"].(string); ok && propertyType != "" {
		query["propertyType"] = propertyType
	}
	if listingType, ok := filters["listingType"].(string); ok && listingType != "" {
		query["listingType"] = listingType
	}
	if minRent, ok := filters["minRent"].(float64); ok {
		query["rent"] = bson.M{"$gte": minRent}
	}
	if maxRent, ok := filters["maxRent"].(float64); ok {
		if _, exists := query["rent"]; exists {
			query["rent"].(bson.M)["$lte"] = maxRent
		} else {
			query["rent"] = bson.M{"$lte": maxRent}
		}
	}
	if isAvailable, ok := filters["isAvailable"].(bool); ok {
		query["isAvailable"] = isAvailable
	}

	// New filters for IsVegetarianPreferred, IsFamilyPreferred, GenderPreference
	if isVegetarianPreferred, ok := filters["isVegetarianPreferred"].(bool); ok {
		query["isVegetarianPreferred"] = isVegetarianPreferred
	}
	if isFamilyPreferred, ok := filters["isFamilyPreferred"].(bool); ok {
		query["isFamilyPreferred"] = isFamilyPreferred
	}
	if genderPreference, ok := filters["genderPreference"].(string); ok && genderPreference != "" {
		query["genderPreference"] = bson.M{"$regex": primitive.Regex{Pattern: genderPreference, Options: "i"}} // Case-insensitive search
	}

	// Perform the search query
	cursor, err := collection.Find(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var properties []*Property
	for cursor.Next(context.Background()) {
		var property Property
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
