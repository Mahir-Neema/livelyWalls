package services

import (
	"backend/utils"
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

const MostSearchedPlacesKey = "most_searched_places"

var RedisClient *redis.Client
var RedisEnabled bool

func ConnectRedis() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		utils.Logger.Println("Warning: REDIS_ADDR environment variable not set. Redis caching and popular places feature will be disabled.") // Log as a warning, not fatal
		RedisEnabled = false                                                                                                                 // Set RedisEnabled flag to false
		return                                                                                                                               // Return without attempting to connect, application will continue
	}

	RedisEnabled = true

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
	})

	_, err := RedisClient.Ping(context.Background()).Result()
	if err != nil {
		utils.Logger.Printf("Warning: Redis connection failed: %v. Redis caching and popular places feature will be disabled. Error: %v", err, err) // Log as warning, not fatal
		RedisEnabled = false                                                                                                                        // Set RedisEnabled flag to false
		RedisClient = nil                                                                                                                           // Set RedisClient to nil to avoid potential nil pointer dereferences later
		return                                                                                                                                      // Return, application will continue without Redis
	}
	utils.Logger.Println("Connected to Redis!")
}

func GetRedisClient() *redis.Client {
	return RedisClient
}

func IsRedisEnabled() bool {
	return RedisEnabled
}

func GetFromRedis(ctx context.Context, key string) (string, error) {
	if !RedisEnabled {
		return "", redis.Nil
	}
	val, err := RedisClient.Get(ctx, key).Result()
	return val, err
}

func SetToRedis(ctx context.Context, key string, value string, expiration time.Duration) error {
	if !RedisEnabled {
		return nil
	}
	err := RedisClient.Set(ctx, key, value, expiration).Err()
	return err
}

// IncrementSearchedPlaceCount increments the search count for a place in Redis Sorted Set.
// For simplicity, let's use 'city' as the 'place' for now.
func IncrementSearchedPlaceCount(ctx context.Context, city string) error {
	if !RedisEnabled { // Check if Redis is enabled before using
		return nil // No error, just don't increment if Redis is disabled
	}
	return RedisClient.ZIncrBy(ctx, MostSearchedPlacesKey, 1, city).Err()
}

// GetTopSearchedPlaces retrieves the top N most searched places from Redis Sorted Set.
func GetTopSearchedPlaces(ctx context.Context, limit int) ([]string, error) {
	if !RedisEnabled { // Check if Redis is enabled before using
		return []string{}, nil // Return empty list if Redis is disabled
	}
	// ZRevRange returns elements in reverse order (highest score first).
	// 0 to limit-1 gets the top 'limit' elements.
	results, err := RedisClient.ZRevRange(ctx, MostSearchedPlacesKey, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}
	return results, nil
}

// GetSearchedPlaceRank retrieves the rank of a place in the sorted set.
func GetSearchedPlaceRank(ctx context.Context, city string) (int64, error) {
	if !RedisEnabled {
		return -1, nil
	}
	rank, err := RedisClient.ZRevRank(ctx, MostSearchedPlacesKey, city).Result()
	if err != nil && err != redis.Nil { // redis.Nil is not an error in this context if the city is not found
		return 0, err
	}
	if err == redis.Nil {
		return -1, nil // Indicate city not found in the sorted set
	}
	return rank + 1, nil // Rank is 0-indexed, so add 1 to get 1-based rank
}

// GetSearchedPlaceScore retrieves the search score of a place.
func GetSearchedPlaceScore(ctx context.Context, city string) (int64, error) {
	if !RedisEnabled {
		return 0, nil // Score is 0 if Redis is disabled
	}
	scoreFloat, err := RedisClient.ZScore(ctx, MostSearchedPlacesKey, city).Result()
	if err != nil && err != redis.Nil {
		return 0, err
	}
	if err == redis.Nil {
		return 0, nil
	}
	return int64(scoreFloat), nil
}
