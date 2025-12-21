package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type SkillsMatch struct {
	JobID           int     `json:"job_id"`
	Title           string  `json:"title"`
	MatchedCount    int     `json:"matched_count"`
	MatchPercentage float64 `json:"match_percentage"`
}
type RequestBody struct {
	UserID int `json:"user_id"`
}

var Db *sql.DB

func GetRecommendedJobs(db *sql.DB, userID int) ([]SkillsMatch, error) {
	query := `
       SELECT 
           j.id,  
           j.title, 
           COUNT(js.skill_id) as matched_count,
           (COUNT(js.skill_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0)) as percentage
       FROM jobs j 
       JOIN job_skills js ON j.id = js.job_id
       WHERE js.skill_id IN (SELECT skill_id FROM user_skills WHERE user_id = $1)
       GROUP BY j.id, j.title
       ORDER BY percentage DESC`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []SkillsMatch
	for rows.Next() {
		var m SkillsMatch
		if err := rows.Scan(&m.JobID, &m.Title, &m.MatchedCount, &m.MatchPercentage); err != nil {
			return nil, err
		}
		matches = append(matches, m)
	}
	return matches, nil

}

func GetRecommendationsHandler(w http.ResponseWriter, r *http.Request) { // Հեռացրինք db-ն այստեղից
	var req RequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	recommendations, err := GetRecommendedJobs(Db, req.UserID)
	if err != nil {
		http.Error(w, "Error fetching recommendations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recommendations)

}
