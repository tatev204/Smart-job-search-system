package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	dblib "scraperdip/db"
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

	ctx := context.Background()
	tx, err := dblib.Get().Begin(ctx)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "Delete from user_skills where user_id=$1", req.UserID)
	if err != nil {
		http.Error(w, "failed to update skills", http.StatusInternalServerError)
		return
	}

	for _, name := range req.SkillNames {
		var skillID int
		err := tx.QueryRow(ctx, "SELECT id FROM skills WHERE name = $1", name).Scan(&skillID)
		if err != nil {
			fmt.Printf("Skill not found: %s\n", name)
			continue
		}
		_, err = tx.Exec(ctx, "INSERT INTO user_skills(user_id, skill_id) VALUES($1, $2)", req.UserID, skillID)
		if err != nil {
			http.Error(w, "Error inserting skills", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "Transaction commit error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Skills added successfully"})
}
