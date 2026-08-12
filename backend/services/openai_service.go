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
	"github.com/openai/openai-go/v3/shared"
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
	Furnishing            *string  `json:"furnishing"`
	SearchSource          *string  `json:"searchSource"`
	Limit                 *int64   `json:"limit"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type PropertyChatIntentResponse struct {
	Reply              string               `json:"reply"`
	ClarifyingQuestion string               `json:"clarifyingQuestion,omitempty"`
	Filters            PropertySearchIntent `json:"filters"`
}

// SearchAgentCallback defines how the agent queries the database.
type SearchAgentCallback func(filters map[string]interface{}, searchSource string, limit int64) (count int, summary string, rawProperties interface{})

func RunPropertySearchAgent(
	ctx context.Context,
	message string,
	previousFilters *PropertySearchIntent,
	conversationHistory []ChatMessage,
	userSearchSource string,
	searchCallback SearchAgentCallback,
) (*PropertyChatIntentResponse, interface{}, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, nil, fmt.Errorf("OPENAI_API_KEY environment variable is not set")
	}

	model := os.Getenv("OPENAI_PROPERTY_CHAT_MODEL")
	if model == "" {
		model = "gpt-4.1-mini"
	}

	clientOptions := []option.RequestOption{option.WithAPIKey(apiKey)}
	if baseURL := strings.TrimSpace(os.Getenv("OPENAI_BASE_URL")); baseURL != "" {
		clientOptions = append(clientOptions, option.WithBaseURL(baseURL))
	}

	client := openai.NewClient(clientOptions...)
	ctx, cancel := context.WithTimeout(ctx, 45*time.Second) // Increased timeout for multi-turn
	defer cancel()

	prompt := buildPropertyAgentPrompt(previousFilters, conversationHistory)

	messages := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(prompt),
		openai.UserMessage(message),
	}

	tools := []openai.ChatCompletionToolUnionParam{
		openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
			Name:        "search_database",
			Description: openai.String("Search the database for matching properties. Call this to check inventory."),
			Parameters: shared.FunctionParameters{
				"type": "object",
				"properties": map[string]interface{}{
					"location":              map[string]interface{}{"type": "string"},
					"city":                  map[string]interface{}{"type": "string"},
					"propertyType":          map[string]interface{}{"type": "string", "enum": []string{"Flat", "Apartment", "House", "Studio"}},
					"listingType":           map[string]interface{}{"type": "string", "enum": []string{"Rent", "Sale", "Flatmate"}},
					"minRent":               map[string]interface{}{"type": "number"},
					"maxRent":               map[string]interface{}{"type": "number"},
					"bedrooms":              map[string]interface{}{"type": "integer"},
					"bathrooms":             map[string]interface{}{"type": "integer"},
					"isAvailable":           map[string]interface{}{"type": "boolean"},
					"isBrokerListing":       map[string]interface{}{"type": "boolean"},
					"isVegetarianPreferred": map[string]interface{}{"type": "boolean"},
					"isFamilyPreferred":     map[string]interface{}{"type": "boolean"},
					"genderPreference":      map[string]interface{}{"type": "string", "enum": []string{"Male", "Female", "Any"}},
					"furnishing":            map[string]interface{}{"type": "string", "enum": []string{"furnished", "semi-furnished", "unfurnished"}},
					"searchSource":          map[string]interface{}{"type": "string", "enum": []string{"platform", "web", "both"}},
					"limit":                 map[string]interface{}{"type": "integer"},
				},
			},
		}),
		openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
			Name:        "final_reply",
			Description: openai.String("Provide the final reply to the user. MUST be called to end the conversation. Call this after searching or if the user question is clarifying."),
			Parameters: shared.FunctionParameters{
				"type": "object",
				"properties": map[string]interface{}{
					"reply":              map[string]interface{}{"type": "string", "description": "The conversational reply to the user."},
					"clarifyingQuestion": map[string]interface{}{"type": "string", "description": "Any question needed if the input is too vague."},
					"filters": map[string]interface{}{
						"type": "object",
						"description": "The final filters applied. Use this to update the UI.",
						"properties": map[string]interface{}{
							"location":              map[string]interface{}{"type": "string"},
							"city":                  map[string]interface{}{"type": "string"},
							"propertyType":          map[string]interface{}{"type": "string"},
							"listingType":           map[string]interface{}{"type": "string"},
							"minRent":               map[string]interface{}{"type": "number"},
							"maxRent":               map[string]interface{}{"type": "number"},
							"bedrooms":              map[string]interface{}{"type": "integer"},
							"bathrooms":             map[string]interface{}{"type": "integer"},
							"isAvailable":           map[string]interface{}{"type": "boolean"},
							"isBrokerListing":       map[string]interface{}{"type": "boolean"},
							"isVegetarianPreferred": map[string]interface{}{"type": "boolean"},
							"isFamilyPreferred":     map[string]interface{}{"type": "boolean"},
							"genderPreference":      map[string]interface{}{"type": "string"},
							"furnishing":            map[string]interface{}{"type": "string"},
							"searchSource":          map[string]interface{}{"type": "string"},
							"limit":                 map[string]interface{}{"type": "integer"},
						},
					},
				},
				"required": []string{"reply", "filters"},
			},
		}),
	}

	var rawProperties interface{}
	maxTurns := 4

	for i := 0; i < maxTurns; i++ {
		chatCompletion, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
			Messages: messages,
			Model:    model,
			Tools:    tools,
		})
		if err != nil {
			return nil, nil, fmt.Errorf("property agent completion error: %w", err)
		}

		if len(chatCompletion.Choices) == 0 {
			return nil, nil, fmt.Errorf("property agent returned no choices")
		}

		choice := chatCompletion.Choices[0]
		
		// DO NOT append choice.Message.ToParam() here because of Gemini thought_signature issues in OpenAI Go SDK

		// Check for tool calls
		if len(choice.Message.ToolCalls) == 0 {
			// If no tools called, we must just return what the agent said as a fallback.
			return &PropertyChatIntentResponse{
				Reply:   choice.Message.Content,
				Filters: PropertySearchIntent{},
			}, rawProperties, nil
		}

		var finalReply *PropertyChatIntentResponse

		for _, toolCall := range choice.Message.ToolCalls {
			if toolCall.Function.Name == "search_database" {
				var intent PropertySearchIntent
				_ = json.Unmarshal([]byte(toolCall.Function.Arguments), &intent)
				
				normalizePropertyIntent(&intent, message)
				
				searchSource := "platform"
				if userSearchSource != "" {
					searchSource = userSearchSource
				} else if intent.SearchSource != nil && *intent.SearchSource != "" {
					searchSource = *intent.SearchSource
				}
				limit := int64(10)
				if intent.Limit != nil && *intent.Limit > 0 {
					limit = *intent.Limit
				}
				if (searchSource == "both" || searchSource == "web") && limit < 15 {
					limit = 50
				}

				count, summary, props := searchCallback(intent.ToSearchFilters(), searchSource, limit)
				if count > 0 {
					rawProperties = props // Keep the latest successful results
				}

				toolResult := fmt.Sprintf("System Tool 'search_database' Result: Found %d properties.\nSummary:\n%s\nNow, either call 'search_database' again with relaxed filters (e.g. increase maxRent) or call 'final_reply'.", count, summary)
				
				// Workaround: Append a UserMessage instead of ToolMessage to avoid Gemini 400 Bad Request
				messages = append(messages, openai.UserMessage(toolResult))
			} else if toolCall.Function.Name == "final_reply" {
				var replyData PropertyChatIntentResponse
				if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &replyData); err == nil {
					normalizePropertyIntent(&replyData.Filters, message)
					finalReply = &replyData
				}
			}
		}

		// If final_reply was called, we're done.
		if finalReply != nil {
			if finalReply.Filters.Limit == nil {
				defaultLimit := int64(10)
				finalReply.Filters.Limit = &defaultLimit
			}
			return finalReply, rawProperties, nil
		}
	}

	return nil, nil, fmt.Errorf("property agent exceeded max turns")
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

func buildPropertyAgentPrompt(previousFilters *PropertySearchIntent, conversationHistory []ChatMessage) string {
	previousFilterJSON := "{}"
	if previousFilters != nil {
		if jsonData, err := json.Marshal(previousFilters); err == nil {
			previousFilterJSON = string(jsonData)
		}
	}

	historyBlock := ""
	if len(conversationHistory) > 0 {
		// Sanitize: remove error messages and deduplicate consecutive same-role messages
		var cleaned []ChatMessage
		for _, msg := range conversationHistory {
			// Skip error/fallback messages
			if strings.Contains(msg.Content, "I could not search with AI right now") {
				continue
			}
			// Skip consecutive duplicates (same role as previous)
			if len(cleaned) > 0 && cleaned[len(cleaned)-1].Role == msg.Role {
				// Keep the latest one by replacing
				cleaned[len(cleaned)-1] = msg
				continue
			}
			cleaned = append(cleaned, msg)
		}

		// Cap to the last 6 messages to avoid bloated payloads
		if len(cleaned) > 6 {
			cleaned = cleaned[len(cleaned)-6:]
		}

		if len(cleaned) > 0 {
			var lines []string
			for _, msg := range cleaned {
				role := "User"
				if msg.Role == "assistant" {
					role = "Assistant"
				}
				lines = append(lines, fmt.Sprintf("%s: %s", role, msg.Content))
			}
			historyBlock = "\nConversation so far:\n" + strings.Join(lines, "\n") + "\n"
		}
	}

	return fmt.Sprintf(`You are the search assistant for SmilingBricks, an Indian rental/property app.

Your goal is to find properties matching the user's request. You have access to tools:
1. 'search_database': Use this to query properties. You MUST use this to verify inventory before replying.
2. 'final_reply': Use this to end the conversation and provide the response to the user.

IMPORTANT INSTRUCTIONS:
- If 'search_database' returns 0 results, DO NOT immediately give up. You MUST automatically relax the filters (e.g., increase maxRent by 10-15%%, drop 'furnishing' or 'bedrooms') and call 'search_database' again.
- You can retry 'search_database' up to 2 times to find properties. 
- If you still find nothing after relaxing filters, or if you found good matches, call 'final_reply'.
- In 'final_reply', explain to the user what you found. If you had to relax the budget or other filters, mention it politely (e.g. "I couldn't find a 2BHK under 40k, but I found some for 42k").
- Handle typos and abbreviations (e.g., "vegatarean" -> vegetarian, "2bhk" -> bedrooms: 2).

Filter Details:
- If request adds male/female without explicitly mentioning rent/sale, set listingType to "Flatmate".
- Use isBrokerListing=false for no-broker/owner-only requests.
- Use maxRent for phrases like "under 40k".
- searchSource: "web" (from web/sites), "platform" (SmilingBricks only), "both" (default).

Previous filters from this session: %s
- Merge the latest user request with previous filters.
- Clear a previous filter if user says "any", "remove", "doesn't matter".
%s`, previousFilterJSON, historyBlock)
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
	addString("furnishing", intent.Furnishing)
	addString("searchSource", intent.SearchSource)
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
