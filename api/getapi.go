package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
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

func getJobByIDFromDB(id string) (*Job, error) {
	var job Job
	query := `SELECT id, title, company, description, location, salary_range FROM "jobs" WHERE id = $1`
	err := db.QueryRow(query, id).Scan(&job.ID, &job.Title, &job.Company, &job.Description, &job.Location, &job.Salary_Range)
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func GetJobHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	job, err := getJobByIDFromDB(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Job not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to retrieve job details", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(job)
}

func GetRecommendedJobsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	query := `
    SELECT 
        j.id, 
        j.title, 
        j.company,
        ROUND(CAST(COUNT(js.skill_id) AS NUMERIC) * 100 / 
        NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0), 2) as match_percentage,
        -- Այստեղ վերցնում ենք հենց ԱՆՈՒՆՆԵՐԸ skills աղյուսակից
        COALESCE(STRING_AGG(s.name, ', '), '') as matched_skills
    FROM jobs j
    JOIN job_skills js ON j.id = js.job_id
    JOIN skills s ON js.skill_id = s.id -- Միացնում ենք սկիլերի անունների աղյուսակը
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
		// Հիշիր՝ Scan-ը պետք է ստանա 5 արգումենտ (MatchedSkills-ը վերջում)
		if err := rows.Scan(&rj.ID, &rj.Title, &rj.Company, &rj.Percentage, &rj.MatchedSkills); err != nil {
			continue
		}
		results = append(results, rj)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
