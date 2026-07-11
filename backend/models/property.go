package models

import (
	"backend/services"
	"backend/utils"
	"context"
	"regexp"
	"strings"
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
	ctx := context.Background()

	if limit <= 0 {
		limit = 10
	}

	// Extract location separately
	location, hasLocation := filters["location"].(string)

	// Build common filters (EXCEPT location)
	matchStage := bson.M{}

	if city, ok := filters["city"].(string); ok && city != "" {
		matchStage["city"] = bson.M{"$regex": primitive.Regex{Pattern: city, Options: "i"}}
	}

	if propertyType, ok := filters["propertyType"].(string); ok && propertyType != "" {
		matchStage["propertyType"] = propertyType
	}

	if listingType, ok := filters["listingType"].(string); ok && listingType != "" {
		matchStage["listingType"] = listingType
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
		matchStage["bedrooms"] = bedrooms
	} else if bedrooms, ok := filters["bedrooms"].(float64); ok && bedrooms > 0 {
		matchStage["bedrooms"] = int(bedrooms)
	}

	if bathrooms, ok := filters["bathrooms"].(int); ok && bathrooms > 0 {
		matchStage["bathrooms"] = bathrooms
	} else if bathrooms, ok := filters["bathrooms"].(float64); ok && bathrooms > 0 {
		matchStage["bathrooms"] = int(bathrooms)
	}

	if isAvailable, ok := filters["isAvailable"].(bool); ok {
		matchStage["isAvailable"] = isAvailable
	}

	if isBrokerListing, ok := filters["isBrokerListing"].(bool); ok {
		if isBrokerListing {
			matchStage["isBrokerListing"] = true
		} else {
			matchStage["isBrokerListing"] = bson.M{"$ne": true}
			matchStage["description"] = bson.M{
				"$not": primitive.Regex{Pattern: "brokerage applicable|brokerage applies|brokerage\\s*applicable|broker fee", Options: "i"},
			}
		}
	}

	if isVegetarianPreferred, ok := filters["isVegetarianPreferred"].(bool); ok {
		matchStage["isVegetarianPreferred"] = isVegetarianPreferred
	}

	if isFamilyPreferred, ok := filters["isFamilyPreferred"].(bool); ok {
		matchStage["isFamilyPreferred"] = isFamilyPreferred
	}

	if genderPreference, ok := filters["genderPreference"].(string); ok && genderPreference != "" {
		matchStage["genderPreference"] = bson.M{
			"$regex": primitive.Regex{Pattern: "^" + genderPreference + "$", Options: "i"},
		}
	}

	var properties []*Property

	// STEP 1: Try Atlas Search (if location present and meaningful)
	if hasLocation && location != "" && len(location) >= 2 {

		pipeline := mongo.Pipeline{
			{
				{"$search", bson.M{
					"index": "location_autocomplete",
					"autocomplete": bson.M{
						"query": location,
						"path":  "location",
						"fuzzy": bson.M{
							"maxEdits":     2,
							"prefixLength": 1,
						},
					},
				}},
			},
			{
				{"$match", matchStage},
			},
			{
				{"$sort", bson.M{"createdAt": -1}},
			},
			{
				{"$limit", limit},
			},
		}

		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			return nil, err
		}

		for cursor.Next(ctx) {
			var property Property
			if err := cursor.Decode(&property); err != nil {
				cursor.Close(ctx)
				return nil, err
			}
			properties = append(properties, &property)
		}
		cursor.Close(ctx)
	}

	// STEP 2: Fallback to regex if no results
	if len(properties) == 0 && hasLocation && location != "" {
		query := cloneBSONMap(matchStage)
		addFlexibleLocationMatch(query, location, false)

		regexProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, regexProperties...)
	}

	// STEP 3: Search location-like fields with tokenized user input.
	if len(properties) == 0 && hasLocation && location != "" {
		query := cloneBSONMap(matchStage)
		addFlexibleLocationMatch(query, location, true)

		flexibleProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, flexibleProperties...)
	}

	// STEP 4: Gender preference usually belongs to flatmate inventory. If AI
	// carried over "Rent" from context, try flatmate before broader relaxation.
	if len(properties) == 0 && hasLocation && location != "" && hasGenderPreference(matchStage) && listingTypeIs(matchStage, "Rent") {
		flatmateMatch := cloneBSONMap(matchStage)
		flatmateMatch["listingType"] = "Flatmate"

		query := cloneBSONMap(flatmateMatch)
		addFlexibleLocationMatch(query, location, true)

		flatmateProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, flatmateProperties...)
	}

	// STEP 5: Relax overly-specific AI filters. Users often say "flat on rent"
	// casually, while inventory may be stored as Apartment or Flatmate.
	if len(properties) == 0 && hasLocation && location != "" {
		relaxedMatch := cloneBSONMap(matchStage)
		delete(relaxedMatch, "propertyType")

		query := cloneBSONMap(relaxedMatch)
		addFlexibleLocationMatch(query, location, true)

		relaxedProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, relaxedProperties...)
	}

	if len(properties) == 0 && hasLocation && location != "" {
		relaxedMatch := cloneBSONMap(matchStage)
		delete(relaxedMatch, "propertyType")
		delete(relaxedMatch, "listingType")

		query := cloneBSONMap(relaxedMatch)
		addFlexibleLocationMatch(query, location, true)

		relaxedProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, relaxedProperties...)
	}

	if len(properties) == 0 && hasLocation && location != "" {
		relaxedMatch := cloneBSONMap(matchStage)
		delete(relaxedMatch, "propertyType")
		delete(relaxedMatch, "listingType")
		delete(relaxedMatch, "isBrokerListing")
		delete(relaxedMatch, "description")

		query := cloneBSONMap(relaxedMatch)
		addFlexibleLocationMatch(query, location, true)

		relaxedProperties, err := findProperties(ctx, collection, query, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, relaxedProperties...)
	}

	if len(properties) == 0 && !hasLocation {
		noLocationProperties, err := findProperties(ctx, collection, matchStage, limit)
		if err != nil {
			return nil, err
		}
		properties = append(properties, noLocationProperties...)
	}

	return properties, nil
}

func hasGenderPreference(matchStage bson.M) bool {
	_, ok := matchStage["genderPreference"]
	return ok
}

func listingTypeIs(matchStage bson.M, expected string) bool {
	listingType, ok := matchStage["listingType"].(string)
	return ok && strings.EqualFold(listingType, expected)
}

func findProperties(ctx context.Context, collection *mongo.Collection, query bson.M, limit int64) ([]*Property, error) {
	findOptions := options.Find().
		SetSort(bson.M{"createdAt": -1}).
		SetLimit(limit)

	cursor, err := collection.Find(ctx, query, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var properties []*Property
	for cursor.Next(ctx) {
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

func cloneBSONMap(source bson.M) bson.M {
	clone := bson.M{}
	for key, value := range source {
		clone[key] = value
	}
	return clone
}

func addFlexibleLocationMatch(query bson.M, location string, includeVariants bool) {
	var clauses []bson.M
	for _, pattern := range locationSearchPatterns(location, includeVariants) {
		regex := primitive.Regex{Pattern: pattern, Options: "i"}
		clauses = append(clauses,
			bson.M{"location": bson.M{"$regex": regex}},
			bson.M{"area": bson.M{"$regex": regex}},
			bson.M{"societyName": bson.M{"$regex": regex}},
		)
	}

	if len(clauses) > 0 {
		query["$or"] = clauses
	}
}

func locationSearchPatterns(location string, includeVariants bool) []string {
	normalized := strings.ToLower(strings.TrimSpace(location))
	if normalized == "" {
		return nil
	}

	seen := map[string]bool{}
	var patterns []string
	add := func(value string) {
		cleaned := strings.TrimSpace(value)
		if cleaned == "" {
			return
		}
		key := strings.ToLower(cleaned)
		if seen[key] {
			return
		}
		seen[key] = true
		patterns = append(patterns, regexp.QuoteMeta(cleaned))
	}

	add(location)

	parts := strings.FieldsFunc(location, func(r rune) bool {
		return r == ',' || r == '-' || r == '/'
	})
	for _, part := range parts {
		add(part)
	}

	if includeVariants {
		for _, word := range strings.Fields(location) {
			if len(word) >= 4 {
				add(word)
			}
		}
	}

	return patterns
}

func IncrementPropertyViews(id string, count int) error {
	collection := GetPropertyCollection()
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.Logger.Printf("Error converting property ID to ObjectID: %v", err)
		return err
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$inc": bson.M{"views": count}}

	_, err2 := collection.UpdateOne(context.Background(), filter, update)
	return err2
}
