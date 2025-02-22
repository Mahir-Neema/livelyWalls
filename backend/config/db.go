package config

import (
	"backend/services"
	"backend/utils"
)

func ConnectDB() {
	utils.InitializeLogger()

	services.ConnectMongo()
	services.ConnectRedis()
	go services.HandleBroadcasts()
	utils.Logger.Println("Database and Services Connected")
}
