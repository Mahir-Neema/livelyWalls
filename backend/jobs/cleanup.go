package jobs

import (
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
	"os"
	"strings"
)

func CleanupJob(property *models.Property) (*models.Property, error) {
	ctx := context.Background()

	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		utils.Logger.Errorf("Failed to create Gemini client: %v", err)
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	propertyJson, err := json.MarshalIndent(property, "", "  ")
	if err != nil {
		utils.Logger.Errorf("Failed to marshal property: %v", err)
		return nil, err
	}

	prompt := fmt.Sprintf(`You are an expert real estate assistant. Given the following struct Property for a property listing, clean and transform it into a valid JSON object that fits this struct:
	
	type Property struct {
	  ID string
	  OwnerID string
	  IsOwnerListing bool
	  IsBrokerListing bool
	  IsAvailable bool
	  IsVegetarianPreferred bool
	  IsFamilyPreferred bool
	  GenderPreference string // Male, Female, Any
	  PropertyType string // "Flat", "Apartment", "House", "Studio"
	  ListingType string // "Rent", "Sale", "Flatmate"
	  Location string
	  SocietyName string
	  Area string
	  City string
	  State string
	  Bedrooms int
	  Bathrooms int
	  AreaSqft float64
	  Balconies int
	  Amenities []string
	  Description string
	  Rent int
	  SecurityDeposit int
	  MaintenanceCharges int
	  LeaseTerm string
	  Photos []string
	  CreatedAt string // ISO-8601 format
	  UpdatedAt string // ISO-8601 format
	  Views int
	  Link string
	}
	
	Here is the input:
	%+v
	
	Clean it by:
	- Removing $numberInt, $numberDouble, $oid, $date wrappers
	- Extracting missing fields from the description
	- Improving grammar and clarity of the description
	- Inferring amenities from the description if the array is empty
	- Inferring city/state from location or description if missing
	- Double check Bedrooms and Bathrooms, IsFamilyPreferred (if bachlors are allowed then IsFamilyPreferred is false)  from description
	- Determining listing type ("Rent", "Sale", "Flatmate") and owner/broker post (IsOwnerListing or IsBrokerListing bool) and dietary preference from description
	- Inferring security deposit and maintenance charges from the description if they are missing
	- If there is any Tech park name or a Land mark in description then append add it in location (like kadubeesanahalli, Embassy Tech Village)
	- If Link is empty in the struct and if contact number exist in description then add one of them as Link.
	- Returning only the final cleaned JSON object only and only json 
	`, string(propertyJson))

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		utils.Logger.Errorf("Failed to generate content: %v", err)
		return nil, err
	}

	var cleaned models.Property
	for _, cand := range resp.Candidates {
		for _, part := range cand.Content.Parts {
			utils.Logger.Printf("Processing cand: %v", part)
			if textPart, ok := part.(genai.Text); ok {
				jsonStr := strings.TrimSpace(string(textPart))
				if strings.HasPrefix(jsonStr, "```json") {
					jsonStr = strings.TrimPrefix(jsonStr, "```json")
				}
				jsonStr = strings.TrimSuffix(jsonStr, "```")
				jsonStr = strings.TrimSpace(jsonStr)
				if err3 := json.Unmarshal([]byte(jsonStr), &cleaned); err3 != nil {
					utils.Logger.Errorf("Failed to unmarshal cleaned property: %v", err3)
					continue
				}
				return &cleaned, nil
			} else {
				utils.Logger.Printf("Skipping non-text part: %T", part)
			}
		}
	}

	utils.Logger.Printf("No valid candidate found in model response")
	return nil, fmt.Errorf("no valid cleaned property returned")
}
