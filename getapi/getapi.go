package main

import (
	"encoding/json"
	"fmt"
	"log"
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
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("row error :%w", err)
	}
	return jobs, nil
}

func getJobsHandler(w http.ResponseWriter, r *http.Request) {
	jobs, err := getJobsFromDB()
	if err != nil {
		log.Printf("Database Error: %v", err)
		http.Error(w, "Failed to retrieve job listings.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(jobs); err != nil {
		http.Error(w, "Failed to encode JSON response", http.StatusInternalServerError)
		log.Printf("JSON encoding error : %v", err)
		return
	}

}
