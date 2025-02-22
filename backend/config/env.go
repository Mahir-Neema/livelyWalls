package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil && !os.IsNotExist(err) {
		log.Printf("Error loading .env file: %v", err)
	} else if os.IsNotExist(err) {
		log.Println(".env file not found, using environment variables directly")
	}
	if os.Getenv("JWT_SECRET") == "" {
		log.Println("Warning: JWT_SECRET environment variable not set. Security will be compromised.")
	}
	if os.Getenv("MONGO_URI") == "" {
		log.Fatal("MONGO_URI environment variable is required.")
	}
	if os.Getenv("MONGO_DB_NAME") == "" {
		log.Fatal("MONGO_DB_NAME environment variable is required.")
	}
	if os.Getenv("REDIS_ADDR") == "" {
		log.Println("Warning: REDIS_ADDR environment variable not set. Caching will be disabled.")
	}
}
