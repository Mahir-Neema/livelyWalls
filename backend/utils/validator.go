package utils

import (
	"regexp"
)

func ValidateEmail(email string) bool {
	re := regexp.MustCompile(`^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$`)
	return re.MatchString(email)
}

func ValidatePassword(password string) bool {
	// Stronger password policy: Minimum 8 characters, require uppercase, lowercase, number, and special character
	if len(password) < 8 {
		return false
	}
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[!@#\$%\^&\*()\-_=\+\[\]\{\}\|;:'",<\.>\/\?]`).MatchString(password)

	return hasUpper && hasLower && hasNumber && hasSpecial
}

func IsValidPropertyType(propertyType string) bool {
	validTypes := []string{"Flat", "Apartment", "House", "Studio"}
	for _, t := range validTypes {
		if t == propertyType {
			return true
		}
	}
	return false
}

func IsValidListingType(listingType string) bool {
	validTypes := []string{"Rent", "Sale"}
	for _, t := range validTypes {
		if t == listingType {
			return true
		}
	}
	return false
}
