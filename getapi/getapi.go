package getapi

import (
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/lib/pq"
)

type Job struct {
	ID           int    `json:"id"`
	Title        string `json:"title"`
	Company      string `json:"company"`
	Location     string `json:"location"`
	Salary_Range string `json:"salary_range"`
	Description  string `json:"description"`
}

type RecommendedJob struct {
	ID            int     `json:"id"`
	Title         string  `json:"title"`
	Company       string  `json:"company"`
	Percentage    float64 `json:"match_percentage"`
	MatchedSkills string  `json:"matched_skills"`
}

func getJobsFromDB() ([]Job, error) {
	rows, err := db.Query("SELECT id, title, company, description, location, salary_range From \"jobs\"")
	if err != nil {
		return nil, fmt.Errorf("error executing query: %w", err)
	}
	defer rows.Close()
	jobs := []Job{}
	for rows.Next() {
		var job Job
		if err := rows.Scan(&job.ID, &job.Title, &job.Company, &job.Description, &job.Location, &job.Salary_Range); err != nil {
			return nil, fmt.Errorf("error scanning row :%w", err)
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func GetJobsHandler(w http.ResponseWriter, r *http.Request) {
	jobs, err := getJobsFromDB()
	if err != nil {
		http.Error(w, "Failed to retrieve job listings.", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

func GetRecommendedJobsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	query := `
    SELECT j.id, j.title, j.company,
           ROUND(CAST(COUNT(js.skill_id) AS NUMERIC) * 100 / 
           NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0), 2) as match_percentage,
           COALESCE(STRING_AGG(s.name, ', '), '') as matched_skills
    FROM jobs j
    JOIN job_skills js ON j.id = js.job_id
    JOIN skills s ON js.skill_id = s.id
    WHERE js.skill_id IN (SELECT skill_id FROM user_skills WHERE user_id = $1)
    GROUP BY j.id, j.title, j.company
    ORDER BY match_percentage DESC`

	rows, err := db.Query(query, userID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []RecommendedJob
	for rows.Next() {
		var rj RecommendedJob
		if err := rows.Scan(&rj.ID, &rj.Title, &rj.Company, &rj.Percentage, &rj.MatchedSkills); err != nil {
			continue
		}
		results = append(results, rj)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
