package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecretKey = []byte("6A675EC5DA653B75C28C31F4EFB93")

// Այս սահմանումը պետք է լինի այստեղ, որպեսզի AuthMiddleware-ը և մյուսները տեսնեն այն
type contextKey string

const claimsContextKey contextKey = "userClaims"

type UserToken struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var id int
	var hash string
	var firstName, lastName string // ՆՈՐ. Ավելացրել ենք այս փոփոխականները

	// ՆՈՐ. Հարցման մեջ ավելացրել ենք firstname և lastname
	// db-ն հասանելի է getapi.go-ից
	err := db.QueryRow("SELECT id, firstname, lastname, password_hash FROM users WHERE email = $1", creds.Email).Scan(&id, &firstName, &lastName, &hash)

	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(creds.Password)) != nil {
		http.Error(w, "Մուտքանունը կամ գաղտնաբառը սխալ է", http.StatusUnauthorized)
		return
	}

	// Տոկենի ստեղծում
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &UserToken{
		UserID: id,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(168 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	tokenString, err := token.SignedString(jwtSecretKey)
	if err != nil {
		http.Error(w, "Տոկենի ստեղծման սխալ", http.StatusInternalServerError)
		return
	}

	// ՆՈՐ. Այստեղ Ֆրոնտենդին ենք ուղարկում նաև մարդու տվյալները
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":     tokenString,
		"user_id":   id,
		"firstName": firstName,
		"lastName":  lastName,
		"email":     creds.Email,
		"status":    "success",
	})
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &UserToken{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return jwtSecretKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Տվյալները փոխանցում ենք հաջորդ հենդլերին context-ի միջոցով
		ctx := context.WithValue(r.Context(), claimsContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
