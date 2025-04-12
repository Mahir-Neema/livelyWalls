package services

import (
	"backend/utils"
	"context"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"google.golang.org/api/option"
)

var FirebaseApp *firebase.App
var FirebaseAuthClient *auth.Client

func InitFirebase() {
	opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		utils.Logger.Printf("error initializing Firebase app: %v\n", err)
		return
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		utils.Logger.Printf("error initializing Firebase Auth client: %v\n", err)
		return
	}

	FirebaseApp = app
	FirebaseAuthClient = client
}
