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
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	OwnerID               string             `json:"owner_id,omitempty" bson:"owner_id,omitempty"`
	IsBrokerListing       bool               `json:"isBrokerListing,omitempty" bson:"isBrokerListing,omitempty"`
	IsAvailable           bool               `json:"isAvailable,omitempty" bson:"isAvailable,omitempty"`
	IsVegetarianPreferred bool               `json:"isVegetarianPreferred,omitempty" bson:"isVegetarianPreferred,omitempty"`
	IsFamilyPreferred     bool               `json:"isFamilyPreferred,omitempty" bson:"isFamilyPreferred,omitempty"`
	GenderPreference      string             `json:"genderPreference,omitempty" bson:"genderPreference,omitempty"` // Male, Female, Any
	PropertyType          string             `json:"propertyType,omitempty" bson:"propertyType,omitempty"`         // "Flat", "Apartment", "House", "Studio"
	ListingType           string             `json:"listingType,omitempty" bson:"listingType,omitempty"`           // "Rent", "Sale"
	Location              string             `json:"location,omitempty" bson:"location,omitempty"`                 // e.g., "Bangalore", "Delhi"
	SocietyName           string             `json:"societyName,omitempty" bson:"societyName,omitempty"`
	Area                  string             `json:"area,omitempty" bson:"area,omitempty"`
	City                  string             `json:"city,omitempty" bson:"city,omitempty"`
	State                 string             `json:"state,omitempty" bson:"state,omitempty"`
	Bedrooms              int                `json:"bedrooms,omitempty" bson:"bedrooms,omitempty"`
	Bathrooms             int                `json:"bathrooms,omitempty" bson:"bathrooms,omitempty"`
	AreaSqft              float64            `json:"areaSqft,omitempty" bson:"areaSqft,omitempty"`
	Balconies             int                `json:"balconies,omitempty" bson:"balconies,omitempty"`
	Amenities             []string           `json:"amenities,omitempty" bson:"amenities,omitempty"`
	Description           string             `json:"description,omitempty" bson:"description,omitempty"`
	Rent                  int                `json:"rent,omitempty" bson:"rent,omitempty"`
	SecurityDeposit       int                `json:"securityDeposit,omitempty" bson:"securityDeposit,omitempty"`
	MaintenanceCharges    int                `json:"maintenanceCharges,omitempty" bson:"maintenanceCharges,omitempty"`
	LeaseTerm             string             `json:"leaseTerm,omitempty" bson:"leaseTerm,omitempty"`
	Photos                []string           `json:"photos,omitempty" bson:"photos,omitempty"`
	CreatedAt             time.Time          `bson:"createdAt,omitempty"`
	UpdatedAt             time.Time          `bson:"updatedAt,omitempty"`
	Views                 int                `json:"views,omitempty" bson:"views,omitempty"`
	Link                  string             `json:"link,omitempty" bson:"link,omitempty"`

	// DistancesFromOffices map[string]float64 `json:"distancesFromOffices,omitempty" bson:"distancesFromOffices,omitempty"` // e.g., {"flipkart": 1.5, "google": 2.0}
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
	go services.IncrementPropertyView(id) // async call to avoid blocking
	return &property, nil
}

func AddProperty(property *Property) error {
	collection := GetPropertyCollection()
	property.ID = primitive.NewObjectID()
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
func SearchProperties(filters map[string]interface{}, limit int64) ([]*Property, error) {
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

	// Sort and limit
	findOptions := options.Find()
	findOptions.SetSort(bson.M{"createdAt": -1})

	if limit <= 0 {
		limit = 10 // Default limit
	}
	findOptions.SetLimit(limit)

	// Search query
	cursor, err := collection.Find(context.Background(), query, findOptions)
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

func IncrementPropertyViews(propertyID string, count int) error {
	collection := GetPropertyCollection()

	filter := bson.M{"_id": propertyID}
	update := bson.M{"$inc": bson.M{"views": count}}

	_, err := collection.UpdateOne(context.Background(), filter, update)
	return err
}
