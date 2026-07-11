package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

type PropertySearchIntent struct {
	Location              *string  `json:"location"`
	City                  *string  `json:"city"`
	PropertyType          *string  `json:"propertyType"`
	ListingType           *string  `json:"listingType"`
	MinRent               *float64 `json:"minRent"`
	MaxRent               *float64 `json:"maxRent"`
	Bedrooms              *int     `json:"bedrooms"`
	Bathrooms             *int     `json:"bathrooms"`
	IsAvailable           *bool    `json:"isAvailable"`
	IsBrokerListing       *bool    `json:"isBrokerListing"`
	IsVegetarianPreferred *bool    `json:"isVegetarianPreferred"`
	IsFamilyPreferred     *bool    `json:"isFamilyPreferred"`
	GenderPreference      *string  `json:"genderPreference"`
	Limit                 *int64   `json:"limit"`
}

type PropertyChatIntentResponse struct {
	Reply              string               `json:"reply"`
	ClarifyingQuestion string               `json:"clarifyingQuestion,omitempty"`
	Filters            PropertySearchIntent `json:"filters"`
}

func ExtractPropertySearchIntent(ctx context.Context, message string, previousFilters *PropertySearchIntent) (*PropertyChatIntentResponse, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY environment variable is not set")
	}

	model := os.Getenv("OPENAI_PROPERTY_CHAT_MODEL")
	if model == "" {
		model = "gpt-4.1-mini"
	}

	client := openai.NewClient(option.WithAPIKey(apiKey))
	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	prompt := buildPropertyIntentPrompt(message, previousFilters)
	resp, err := client.Responses.New(ctx, responses.ResponseNewParams{
		Model: openai.ChatModel(model),
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String(prompt),
		},
	})
	if err != nil {
		return nil, err
	}

	var parsed PropertyChatIntentResponse
	if err := json.Unmarshal([]byte(cleanJSONResponse(resp.OutputText())), &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse OpenAI property intent: %w", err)
	}

	if parsed.Reply == "" {
		parsed.Reply = "I found a few filters from your request and searched matching properties."
	}
	if parsed.Filters.Limit == nil {
		defaultLimit := int64(10)
		parsed.Filters.Limit = &defaultLimit
	}
	normalizePropertyIntent(&parsed.Filters, message)

	return &parsed, nil
}

func normalizePropertyIntent(filters *PropertySearchIntent, message string) {
	if filters == nil || filters.GenderPreference == nil || filters.ListingType == nil {
		return
	}

	normalizedMessage := strings.ToLower(message)
	hasGenderWord := strings.Contains(normalizedMessage, "male") ||
		strings.Contains(normalizedMessage, "female")
	hasExplicitRentOrSale := strings.Contains(normalizedMessage, "rent") ||
		strings.Contains(normalizedMessage, "sale") ||
		strings.Contains(normalizedMessage, "buy")

	if hasGenderWord && !hasExplicitRentOrSale && strings.EqualFold(*filters.ListingType, "Rent") {
		flatmate := "Flatmate"
		filters.ListingType = &flatmate
	}
}

func buildPropertyIntentPrompt(message string, previousFilters *PropertySearchIntent) string {
	previousFilterJSON := "{}"
	if previousFilters != nil {
		if jsonData, err := json.Marshal(previousFilters); err == nil {
			previousFilterJSON = string(jsonData)
		}
	}

	return fmt.Sprintf(`You are the search assistant for SmilingBricks, an Indian rental/property app.

Convert the user's natural-language request into property search filters.
Return only valid JSON. Do not wrap it in markdown.

You may receive previous filters from the same chat session.
- Merge the latest user request with previous filters.
- Preserve previous filters when the latest request is a refinement like "2BHK", "make it no broker", or "under 60k".
- The latest user request overrides previous filters when it clearly changes a field.
- Clear a previous filter only if the user explicitly says "any", "remove", "doesn't matter", or similar for that field.
- If no previous filter is useful, ignore it.
- If the latest user request is only a location or locality name, search broadly for that location.
- Do not infer listingType as Rent from a location-only request.
- Do not ask for budget or rent/sale just because the user only gave a location.

Allowed filter values:
- propertyType: "Flat", "Apartment", "House", "Studio"
- listingType: "Rent", "Sale", "Flatmate"
- genderPreference: "Male", "Female", "Any"
- rent values must be numbers in INR
- "flatmate" describes listingType, not propertyType
- do not infer propertyType from "BHK" or "flatmate"; only set propertyType when the user explicitly says apartment, flat, house, or studio
- only set listingType when the user explicitly says rent, sale, flatmate, roommate, room, or sharing
- if the latest request adds only "male" or "female" without explicitly saying rent or sale, prefer listingType "Flatmate" because gender preference is normally flatmate inventory
- do not preserve a previous listingType of "Rent" when the latest request adds only a male/female preference
- use isBrokerListing=false for no-broker/direct-owner/owner-only requests
- use maxRent for phrases like "under 40k"
- use bedrooms for "1BHK", "2 BHK", etc.
- include only fields you can infer confidently; otherwise use null
- if the request is too vague, set clarifyingQuestion to a short question

JSON shape:
{
  "reply": "short friendly explanation of what you searched for",
  "clarifyingQuestion": "",
  "filters": {
    "location": null,
    "city": null,
    "propertyType": null,
    "listingType": null,
    "minRent": null,
    "maxRent": null,
    "bedrooms": null,
    "bathrooms": null,
    "isAvailable": true,
    "isBrokerListing": null,
    "isVegetarianPreferred": null,
    "isFamilyPreferred": null,
    "genderPreference": null,
    "limit": 10
  }
}

Previous filters: %s
Latest user request: %q`, previousFilterJSON, message)
}

func cleanJSONResponse(text string) string {
	cleaned := strings.TrimSpace(text)
	cleaned = strings.TrimPrefix(cleaned, "```json")
	cleaned = strings.TrimPrefix(cleaned, "```")
	cleaned = strings.TrimSuffix(cleaned, "```")
	return strings.TrimSpace(cleaned)
}

func (intent PropertySearchIntent) ToSearchFilters() map[string]interface{} {
	filters := make(map[string]interface{})

	addString := func(key string, value *string) {
		if value != nil && strings.TrimSpace(*value) != "" {
			filters[key] = strings.TrimSpace(*value)
		}
	}
	addFloat := func(key string, value *float64) {
		if value != nil && *value > 0 {
			filters[key] = *value
		}
	}
	addInt := func(key string, value *int) {
		if value != nil && *value > 0 {
			filters[key] = *value
		}
	}
	addBool := func(key string, value *bool) {
		if value != nil {
			filters[key] = *value
		}
	}

	addString("location", intent.Location)
	addString("city", intent.City)
	addString("propertyType", intent.PropertyType)
	addString("listingType", intent.ListingType)
	addString("genderPreference", intent.GenderPreference)
	addFloat("minRent", intent.MinRent)
	addFloat("maxRent", intent.MaxRent)
	addInt("bedrooms", intent.Bedrooms)
	addInt("bathrooms", intent.Bathrooms)
	addBool("isAvailable", intent.IsAvailable)
	addBool("isBrokerListing", intent.IsBrokerListing)
	addBool("isVegetarianPreferred", intent.IsVegetarianPreferred)
	addBool("isFamilyPreferred", intent.IsFamilyPreferred)

	if intent.Limit != nil && *intent.Limit > 0 {
		filters["limit"] = float64(*intent.Limit)
	}

	return filters
}
