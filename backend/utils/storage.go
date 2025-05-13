package utils

import (
	"bytes"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

var (
	s3Client   *s3.S3
	bucketName string
)

// InitS3 initializes the S3 client
func InitS3() error {
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	bucketName = os.Getenv("S3_BUCKET_NAME")
	endpoint := os.Getenv("S3_ENDPOINT")

	// Ensure bucketName is set
	if bucketName == "" {
		return fmt.Errorf("S3_BUCKET_NAME environment variable is not set")
	}

	// Initialize S3 session
	sess, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
		Endpoint:    aws.String(endpoint),
		Region:      aws.String("ap-south-1"),
	})
	if err != nil {
		return fmt.Errorf("failed to initialize S3 session: %v", err)
	}

	s3Client = s3.New(sess)
	return nil
}

// UploadFileToS3 uploads a file to S3 and returns its public URL
func UploadFileToS3(file multipart.File, fileHeader *multipart.FileHeader, fileName string, userID string) (string, error) {
	// Unique filename
	//fileName := fmt.Sprintf("/properties/user_%s/%s%s", userID, time.Now().Format("20060102150405"), filepath.Ext(fileHeader.Filename))
	Logger.Printf("Uploading file: %s", fileName)

	// Read file into memory
	buffer, err := io.ReadAll(file)
	if err != nil {
		Logger.Printf("Failed to read file: %v", err)
		return "", err
	}

	// Upload to S3
	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket:        aws.String("/" + bucketName),
		Key:           aws.String(fileName),
		Body:          bytes.NewReader(buffer),
		ContentLength: aws.Int64(int64(len(buffer))), // Correct size calculation
		ContentType:   aws.String(http.DetectContentType(buffer)),
		ACL:           aws.String("public-read"),
	})
	if err != nil {
		Logger.Printf("Failed to upload file to S3: %v", err)
		return "", err
	}

	// Generate public URL
	supabaseProjectURL := os.Getenv("SUPABASE_PROJECT_URL")
	url := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseProjectURL, bucketName, fileName)

	return url, nil
}
