package models

import (
	"fmt"
	"strings"
	"time"
)

type UnifiedProperty struct {
	ID                   string     `json:"id"`
	Title                string     `json:"title"`
	Description          string     `json:"description"`
	Location             string     `json:"location"`
	Rent                 int        `json:"rent"`
	Bedrooms             int        `json:"bedrooms"`
	Bathrooms            int        `json:"bathrooms"`
	PropertyType         string     `json:"propertyType"`
	ListingType          string     `json:"listingType"`
	Furnishing           string     `json:"furnishing"`
	GenderPreference     string     `json:"genderPreference"`
	IsVegetarianPreferred bool      `json:"isVegetarianPreferred"`
	IsFamilyPreferred    bool       `json:"isFamilyPreferred"`
	IsBrokerListing      bool       `json:"isBrokerListing"`
	IsAvailable          bool       `json:"isAvailable"`
	Amenities            []string   `json:"amenities"`
	Photos               []string   `json:"photos"`
	Deposit              int        `json:"deposit"`
	Source               string     `json:"source"`
	SourceURL            string     `json:"sourceUrl"`
	CrawledAt            *time.Time `json:"crawledAt,omitempty"`
	SocietyName          string     `json:"societyName,omitempty"`
}

func FromPlatformProperty(p *Property) UnifiedProperty {
	return UnifiedProperty{
		ID:                   p.ID.Hex(),
		Title:                p.SocietyName,
		Description:          p.Description,
		Location:             p.Location,
		Rent:                 p.Rent,
		Bedrooms:             p.Bedrooms,
		Bathrooms:            p.Bathrooms,
		PropertyType:         p.PropertyType,
		ListingType:          p.ListingType,
		Furnishing:           "",
		GenderPreference:     p.GenderPreference,
		IsVegetarianPreferred: p.IsVegetarianPreferred,
		IsFamilyPreferred:    p.IsFamilyPreferred,
		IsBrokerListing:      p.IsBrokerListing,
		IsAvailable:          p.IsAvailable,
		Amenities:            p.Amenities,
		Photos:               p.Photos,
		Deposit:              p.SecurityDeposit,
		Source:               "platform",
		SourceURL:            p.Link,
		SocietyName:          p.SocietyName,
	}
}

func FromCrawlerProperty(p *CrawlerProperty) UnifiedProperty {
	title := p.Title
	if title == "" {
		title = p.Location
	}

	bedrooms := p.Bedrooms
	if bedrooms == 0 {
		bedrooms = p.BHK
	}

	return UnifiedProperty{
		ID:                   p.ID.Hex(),
		Title:                title,
		Description:          p.Description,
		Location:             p.Location,
		Rent:                 p.Rent,
		Bedrooms:             bedrooms,
		Bathrooms:            p.Bathrooms,
		PropertyType:         p.Type,
		ListingType:          "Rent",
		Furnishing:           p.Furnishing,
		GenderPreference:     p.GenderPreference,
		IsVegetarianPreferred: p.IsVegetarianPreferred,
		IsFamilyPreferred:    p.IsFamilyPreferred,
		IsBrokerListing:      p.IsBrokerListing,
		IsAvailable:          p.IsActive,
		Amenities:            p.Amenities,
		Photos:               p.Images,
		Deposit:              p.Deposit,
		Source:               p.Source,
		SourceURL:            p.SourceURL,
		CrawledAt:            &p.CrawledAt,
	}
}

type MergedProperties struct {
	Properties      []UnifiedProperty `json:"properties"`
	SourceBreakdown map[string]int    `json:"sourceBreakdown"`
}

func MergeAndDeduplicate(platformProps []*Property, crawlerProps []*CrawlerProperty) MergedProperties {
	unified := make([]UnifiedProperty, 0, len(platformProps)+len(crawlerProps))
	breakdown := map[string]int{}

	for _, p := range platformProps {
		u := FromPlatformProperty(p)
		unified = append(unified, u)
		breakdown["platform"]++
	}

	for _, p := range crawlerProps {
		u := FromCrawlerProperty(p)
		unified = append(unified, u)
		breakdown[u.Source]++
	}

	deduped := deduplicateProperties(unified)

	return MergedProperties{
		Properties:      deduped,
		SourceBreakdown: breakdown,
	}
}

func deduplicateProperties(props []UnifiedProperty) []UnifiedProperty {
	type dedupKey struct {
		normalizedLocation string
		rent               int
		bedrooms           int
	}

	seen := make(map[dedupKey]int)
	var result []UnifiedProperty

	for _, p := range props {
		loc := strings.ToLower(strings.TrimSpace(p.Location))
		key := dedupKey{
			normalizedLocation: normalizeLocation(loc),
			rent:               p.Rent,
			bedrooms:           p.Bedrooms,
		}

		if idx, exists := seen[key]; exists {
			if result[idx].Source == "platform" && p.Source != "platform" {
				continue
			}
			if p.Source == "platform" && result[idx].Source != "platform" {
				result[idx] = p
			}
			continue
		}

		seen[key] = len(result)
		result = append(result, p)
	}

	return result
}

func normalizeLocation(loc string) string {
	loc = strings.ToLower(loc)
	parts := strings.Split(loc, ",")
	if len(parts) > 0 {
		return strings.TrimSpace(parts[0])
	}
	return loc
}

func BuildSearchLabel(filters map[string]interface{}) string {
	var parts []string

	if bedrooms, ok := filters["bedrooms"].(float64); ok && bedrooms > 0 {
		parts = append(parts, fmt.Sprintf("%dBHK", int(bedrooms)))
	}
	if propertyType, ok := filters["propertyType"].(string); ok && propertyType != "" {
		parts = append(parts, propertyType)
	}
	if listingType, ok := filters["listingType"].(string); ok && listingType != "" {
		parts = append(parts, listingType)
	}
	if location, ok := filters["location"].(string); ok && location != "" {
		parts = append(parts, fmt.Sprintf("in %s", location))
	}
	if maxRent, ok := filters["maxRent"].(float64); ok && maxRent > 0 {
		parts = append(parts, fmt.Sprintf("under ₹%s", formatNumber(int(maxRent))))
	}
	if furnishing, ok := filters["furnishing"].(string); ok && furnishing != "" {
		parts = append(parts, furnishing)
	}

	if len(parts) > 0 {
		return strings.Join(parts, " ")
	}
	return "properties"
}

func formatNumber(n int) string {
	s := fmt.Sprintf("%d", n)
	if len(s) <= 3 {
		return s
	}
	result := ""
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			result += ","
		}
		result += string(c)
	}
	return result
}
