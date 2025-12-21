package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type UserSkillsRequest struct {
	SkillNames []string `json:"skill_names"`
	UserID     int      `json:"user_id"`
}

func AddUserSkillsHandler(w http.ResponseWriter, r *http.Request) {
	var req UserSkillsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body ", http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec("Delete from user_skills where user_id=$1", req.UserID)
	if err != nil {
		tx.Rollback()
		http.Error(w, "failed to update skills", http.StatusInternalServerError)
		return
	}
	for _, name := range req.SkillNames {
		var skillID int
		err := tx.QueryRow("SELECT id FROM skills WHERE name = $1", name).Scan(&skillID)
		if err != nil {
			fmt.Printf("Skill not found: %s\n", name)
			continue
		}
		_, err = tx.Exec("INSERT INTO user_skills(user_id, skill_id) VALUES($1, $2)", req.UserID, skillID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Error inserting skills", http.StatusInternalServerError)
			return
		}
	}
	if err := tx.Commit(); err != nil {
		http.Error(w, "Transactioncommit error ", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Contetnt-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Skills added successfully"})

}
