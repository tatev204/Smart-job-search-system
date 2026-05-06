package api

import (
	"encoding/json"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int    `json:"id"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
	Password     string `json:"password,omitempty"`
}

func userRegister(w http.ResponseWriter, r *http.Request) {
	var newUser User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Գաղտնաբառի հեշավորում[cite: 8]
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Տվյալների պահպանում SQL բազայում[cite: 8]
	sqlStatement := `INSERT INTO users (firstname, lastname, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`
	var newID int
	err = db.QueryRow(sqlStatement, newUser.FirstName, newUser.LastName, newUser.Email, string(hashedPassword)).Scan(&newID)

	if err != nil {
		log.Println("DB Error:", err)
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	// ✅ Նամակի ուղարկում ֆոնային ռեժիմում
	go SendWelcomeEmail(newUser.Email, newUser.FirstName)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      newID,
		"message": "User registered successfully",
	})
}
