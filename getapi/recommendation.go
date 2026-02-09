package getapi

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type SkillsMatch struct {
	JobID           int     `json:"job_id"`
	Title           string  `json:"title"`
	MatchedCount    int     `json:"matched_count"`
	MatchPercentage float64 `json:"match_percentage"`
}

func GetMatchingJobs(db *sql.DB, userID int) ([]SkillsMatch, error) {
	query := `
      SELECT 
          j.id, 
          j.title, 
          COUNT(js.skill_id) as matched_count,
          COALESCE((COUNT(js.skill_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0)), 0) as percentage,
          STRING_AGG(s.name, ', ') as matched_skills 
      FROM jobs j
      JOIN job_skills js ON j.id = js.job_id
      JOIN skills s ON js.skill_id = s.id 
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

	if matches == nil {
		matches = []SkillsMatch{}
	}

	return matches, nil
}

func RecommendJobsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userIDStr := r.URL.Query().Get("user_id")
		if userIDStr == "" {
			http.Error(w, "user_id is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user_id", http.StatusBadRequest)
			return
		}

		recommendations, err := GetMatchingJobs(db, userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(recommendations)
	}
}
