package services

import (
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

const AiSuggestionsCachePrefix = "ai_suggestions:"

func GetNearbyLocations(location string) ([]string, error) {
	ctx := context.Background()

	// 1. Check Cache first
	cacheKey := AiSuggestionsCachePrefix + strings.ToLower(strings.TrimSpace(location))
	if val, err := GetFromRedis(ctx, cacheKey); err == nil {
		var cachedLocations []string
		if err := json.Unmarshal([]byte(val), &cachedLocations); err == nil {
			utils.Logger.Printf("AI Cache Hit: %s", location)
			return cachedLocations, nil
		}
	}

	utils.Logger.Printf("AI Cache Miss: %s. Calling Gemini API...", location)

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY environment variable is not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-flash-latest")

	prompt := fmt.Sprintf("List 5 nearby neighborhoods or popular areas close to '%s'. Return only a JSON array of strings. No conversational text.", location)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates returned from AI")
	}

	var locations []string
	for _, cand := range resp.Candidates {
		for _, part := range cand.Content.Parts {
			if text, ok := part.(genai.Text); ok {
				// Simple parsing logic: handle the case where Gemini returns code blocks
				cleanText := string(text)
				// Basic cleaning if wrapped in markdown
				if strings.HasPrefix(cleanText, "```json") {
					cleanText = strings.TrimPrefix(cleanText, "```json")
					cleanText = strings.TrimSuffix(cleanText, "```")
				} else if strings.HasPrefix(cleanText, "```") {
					cleanText = strings.TrimPrefix(cleanText, "```")
					cleanText = strings.TrimSuffix(cleanText, "```")
				}
				cleanText = strings.TrimSpace(cleanText)

				if err := json.Unmarshal([]byte(cleanText), &locations); err == nil {
					// cache the result before returning
					if jsonData, err := json.Marshal(locations); err == nil {
						if err := SetToRedis(ctx, cacheKey, string(jsonData), 24*time.Hour); err == nil {
							utils.Logger.Printf("AI Suggestions added to Redis for: %s", location)
						}
					}
					return locations, nil
				}
			}
		}
	}

	return nil, fmt.Errorf("failed to parse AI response")
}
