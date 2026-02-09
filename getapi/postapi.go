package getapi

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int    `json:"id"`
	FirstName    string `json:"firstName"`
	Lastname     string `json:"lastName"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
	Password     string `json:"password,omitempty"`
}

func userRegister(w http.ResponseWriter, r *http.Request) {
	var newUser User

	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid Json input", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Bcrypt Hashing Error: %v", err)
		http.Error(w, "Error while processing password", http.StatusInternalServerError)
		return
	}

	passwordHashStr := string(hashedPassword)

	sqlStatement := ` INSERT INTO users (firstname, lastname,email,password_hash)
VALUES ($1,$2,$3,$4)
RETURNING id `

	var newID int
	err = db.QueryRow(sqlStatement, newUser.FirstName, newUser.Lastname, newUser.Email, passwordHashStr).Scan(&newID)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			log.Printf("Registration Failed: Email already exists: %s", newUser.Email)
			http.Error(w, "This email address is already registered.", http.StatusConflict) // 409 Conflict
			return
		}

		log.Printf("DB Insertion Error: %v", err)
		http.Error(w, "Failed to create user due to server error", http.StatusInternalServerError)
		return
	}
	newUser.ID = newID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	responseUser := struct {
		ID        int    `json:"id"`
		Email     string `json:"email"`
		FirstName string `json:"firstname"`
	}{
		ID:        newID,
		Email:     newUser.Email,
		FirstName: newUser.FirstName,
	}

	json.NewEncoder(w).Encode(responseUser)

}

func userLogin(email string) (*User, error) {
	var user User
	sqlStatement := `SELECT id,email,password_hash FROM users WHERE email=$1`
	err := db.QueryRow(sqlStatement, email).Scan(&user.ID, &user.Email, &user.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found with email: %w", email)
		}
		return nil, fmt.Errorf("database query error :%w", err)
	}
	return &user, nil

}
