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

func ExtractPropertySearchIntent(ctx context.Context, message string) (*PropertyChatIntentResponse, error) {
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

	prompt := buildPropertyIntentPrompt(message)
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

	return &parsed, nil
}

func buildPropertyIntentPrompt(message string) string {
	return fmt.Sprintf(`You are the search assistant for SmilingBricks, an Indian rental/property app.

Convert the user's natural-language request into property search filters.
Return only valid JSON. Do not wrap it in markdown.

Allowed filter values:
- propertyType: "Flat", "Apartment", "House", "Studio"
- listingType: "Rent", "Sale", "Flatmate"
- genderPreference: "Male", "Female", "Any"
- rent values must be numbers in INR
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

User request: %q`, message)
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
