package jobs

import (
	"backend/models"
	"backend/services"
	"log"
)

func SyncPropertyViewsToMongo() error {
	viewCounts, err := services.GetAllPropertyViews()
	if err != nil {
		log.Printf("Failed to fetch views from Redis: %v", err)
		return err
	}

	for propertyID, count := range viewCounts {
		err := models.IncrementPropertyViews(propertyID, int(count))
		if err != nil {
			log.Printf("Failed to update MongoDB for property %s: %v", propertyID, err)
			continue
		}
		services.ClearViewCount(propertyID)
	}
	return nil
}
