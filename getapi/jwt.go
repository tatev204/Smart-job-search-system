package getapi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecretKey = []byte("6A675EC5DA653B75C28C31F4EFB93")

type contextKey string

const claimsContextKey contextKey = "userClaims"

type UserToken struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int, role string) (string, error) {
	endofTime := time.Now().Add(time.Hour * 24)
	usertoken := &UserToken{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(endofTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "JobSystem",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, usertoken)
	tokenString, err := token.SignedString(jwtSecretKey)

	if err != nil {
		return "", fmt.Errorf("could not sign token: %w", err)
	}
	return tokenString, nil
}

func VerifyToken(tokenString string) (*UserToken, error) {
	usertoken := &UserToken{}
	_, err := jwt.ParseWithClaims(tokenString, usertoken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Method)
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}
	return usertoken, nil
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid JSON input", http.StatusBadRequest)
		return
	}
	user, err := userLogin(creds.Email)
	if err != nil {

		log.Printf("Login failed %s:%v", creds.Email, err)
		http.Error(w, "Invalid credentials or user not found", http.StatusUnauthorized)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(creds.Password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			log.Printf("Login Failed for %s:Wrong Password", creds.Email)
			http.Error(w, "Invalid credentials or user not found", http.StatusUnauthorized)
			return
		}
		log.Printf("Bcrypt error", creds.Email)
		http.Error(w, "error during password verification", http.StatusInternalServerError)
		return
	}
	role := "user"
	tokenString, err := GenerateToken(user.ID, role)
	if err != nil {
		log.Printf("Token Generation error :%v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   tokenString,
		"message": "Token generated successfully",
		"user_id": user.ID,
		"email":   user.Email,
	})
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, "Invalid token format. Must be 'Bearer [token]'", http.StatusUnauthorized)
			return
		}
		tokenString := tokenParts[1]

		claims, err := VerifyToken(tokenString)
		if err != nil {
			http.Error(w, "Token verification failed:"+err.Error(), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), claimsContextKey, claims)
		r = r.WithContext(ctx)

		log.Printf("User ID %d successfully authenticated.", claims.UserID)
		next.ServeHTTP(w, r)
	}
}

func ProtectedHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	claims := r.Context().Value(claimsContextKey).(*UserToken)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data":   fmt.Sprintf("Welcome to the secret area! Your User ID is %d and Role is %s.", claims.UserID, claims.Role),
	})
}
