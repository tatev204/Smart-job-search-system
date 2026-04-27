package api

import (
	"context"
	"encoding/json"
	"net/http"
	dblib "scraperdip/db"
)

type Skill struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetAllSkillsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := dblib.Get().Query(context.Background(), "SELECT id, name FROM skills ORDER BY name ASC")
	if err != nil {
		http.Error(w, "Failed to load skills.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var skills []Skill
	for rows.Next() {
		var s Skill
		if err := rows.Scan(&s.ID, &s.Name); err != nil {
			http.Error(w, "Data processing error", http.StatusInternalServerError)
			return
		}
		skills = append(skills, s)
	}

	if skills == nil {
		skills = []Skill{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(skills)
}
