package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type JobSkillsMatch struct {
	JobID           int     `json:"job_id"`
	Title           string  `json:"title"`
	MatchedCount    int     `json:"matched_count"`
	MatchPercentage float64 `json:"match_percentage"`
}

type RecommendationRequestBody struct {
	UserID int `json:"user_id"`
}

func GetMatchingJobs(db *sql.DB, userID int) ([]JobSkillsMatch, error) {
	query := `
      SELECT
          j.id,
          j.title,
          COUNT(js.skill_id) as matched_count,
          COALESCE((COUNT(js.skill_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0)), 0) as percentage
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

	var matches []JobSkillsMatch
	for rows.Next() {
		var m JobSkillsMatch
		if err := rows.Scan(&m.JobID, &m.Title, &m.MatchedCount, &m.MatchPercentage); err != nil {
			return nil, err
		}
		matches = append(matches, m)
	}
	return matches, nil
}

func RecommendJobsHandler(w http.ResponseWriter, r *http.Request) {
	var req RecommendationRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	recommendations, err := GetMatchingJobs(db, req.UserID)
	if err != nil {
		http.Error(w, "Error fetching recommendations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recommendations)
}
