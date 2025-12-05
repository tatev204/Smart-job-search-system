package main

import (
	"database/sql"
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

var db *sql.DB

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
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

func main() {
	var err error
	connStr := "user=postgres password=tatev1234 dbname=JobDB sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open database connection: %v", err)

	}

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to open database connection: %v", err)
	}
	log.Printf("Successfully connected to the PostgreSQL database.")
	defer db.Close()

	http.HandleFunc("/jobs", getJobsHandler)
	port := ":9090"
	fmt.Printf("GET API Server started on port %s\n", port)

	log.Fatal(http.ListenAndServe(port, nil))
}
