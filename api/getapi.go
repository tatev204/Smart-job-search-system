package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

// --- STRUCTS ---
type Job struct {
	ID              int    `json:"id"`
	Title           string `json:"title"`
	Company         string `json:"company"`
	Location        string `json:"location"`
	Salary_Range    string `json:"salary_range"`
	Description     string `json:"description"`
	FullDescription string `json:"full_description"`
	PhoneNumber     string `json:"phone_number"`
}

type RecommendedJob struct {
	ID            int     `json:"id"`
	Title         string  `json:"title"`
	Company       string  `json:"company"`
	Percentage    float64 `json:"match_percentage"`
	MatchedSkills string  `json:"matched_skills"`
}

type SaveJobRequest struct {
	JobID int `json:"job_id"`
}

func InitDB(database *sql.DB) {
	db = database
}

func StartAPI(database *sql.DB) {
	db = database
	r := mux.NewRouter()

	r.HandleFunc("/register", userRegister).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", LoginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/jobs", GetJobsHandler).Methods("GET")
	r.HandleFunc("/jobs/{id}", GetJobHandler).Methods("GET")
	r.HandleFunc("/recommendations", GetRecommendedJobsHandler).Methods("GET")
	r.HandleFunc("/extract-text", AuthMiddleware(ExtractOnlyTextHandler)).Methods("POST", "OPTIONS")

	r.HandleFunc("/save-job", AuthMiddleware(SaveJobHandler)).Methods("POST", "OPTIONS")
	r.HandleFunc("/saved-jobs", AuthMiddleware(GetSavedJobsHandler)).Methods("GET", "OPTIONS")

	r.HandleFunc("/ai/upload", AIUploadHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/ai/match-cv", AuthMiddleware(AICVMatchHandler)).Methods("POST", "OPTIONS")
	r.HandleFunc("/ai/elastic-search", AIElasticSearchHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/upload-resume", AuthMiddleware(UploadResumeHandler)).Methods("POST", "OPTIONS")

	log.Println("✅ API server is running on http://localhost:8088")
	log.Fatal(http.ListenAndServe(":8088", enableCORS(r)))
}

func GetJobsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, title, COALESCE(company, ''), COALESCE(description, ''), COALESCE(location, ''), COALESCE(salary_range, '') FROM jobs ORDER BY id DESC")
	if err != nil {
		http.Error(w, "Query error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var j Job
		err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Description, &j.Location, &j.Salary_Range)
		if err != nil {
			log.Println("Scan error:", err)
			continue
		}
		jobs = append(jobs, j)
	}

	if jobs == nil {
		jobs = []Job{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

func GetJobHandler(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var j Job

	// 100% ապահովագրված SQL հարցում. բոլոր դաշտերը վերածում ենք TEXT-ի,
	// որպեսզի COALESCE-ը խնդիր չառաջացնի INT կամ NULL արժեքների հետ:
	query := `
		SELECT id, 
		       COALESCE(CAST(title AS TEXT), ''), 
		       COALESCE(CAST(company AS TEXT), ''), 
		       COALESCE(CAST(description AS TEXT), ''), 
		       COALESCE(CAST(location AS TEXT), ''), 
		       COALESCE(CAST(salary_range AS TEXT), ''),
               COALESCE(CAST(full_description AS TEXT), ''),
               COALESCE(CAST(phone_number AS TEXT), '')
		FROM jobs WHERE id = $1`

	err := db.QueryRow(query, id).
		Scan(&j.ID, &j.Title, &j.Company, &j.Description, &j.Location, &j.Salary_Range, &j.FullDescription, &j.PhoneNumber)

	if err != nil {
		log.Printf("Կրիտիկական SQL ՍԽԱԼ GetJobHandler-ում (ID: %s): %v\n", id, err)
		http.Error(w, "Աշխատանքը չի գտնվել", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(j)
}

func SaveJobHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(claimsContextKey).(*UserToken)
	if !ok {
		http.Error(w, "Չհաջողվեց նույնականացնել օգտատիրոջը", http.StatusUnauthorized)
		return
	}

	var req SaveJobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Սխալ հարցում", http.StatusBadRequest)
		return
	}

	query := `
        INSERT INTO saved_jobs (user_id, job_id, saved_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP) 
        ON CONFLICT DO NOTHING`

	_, err := db.Exec(query, claims.UserID, req.JobID)
	if err != nil {
		http.Error(w, "Տվյալների բազայի սխալ: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Աշխատանքը պահպանվեց"})
}

func GetSavedJobsHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(claimsContextKey).(*UserToken)
	if !ok {
		http.Error(w, "Չհաջողվեց նույնականացնել օգտատիրոջը", http.StatusUnauthorized)
		return
	}

	query := `
        SELECT j.id, j.title, COALESCE(j.company, ''), COALESCE(j.location, ''), COALESCE(j.salary_range, '') 
        FROM jobs j
        JOIN saved_jobs sj ON j.id = sj.job_id
        WHERE sj.user_id = $1
        ORDER BY sj.saved_at DESC`

	rows, err := db.Query(query, claims.UserID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var j Job
		err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Location, &j.Salary_Range)
		if err == nil {
			jobs = append(jobs, j)
		}
	}
	if jobs == nil {
		jobs = []Job{}
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
       SELECT 
          j.id, j.title, j.company,
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

	var res []RecommendedJob
	for rows.Next() {
		var rj RecommendedJob
		err := rows.Scan(&rj.ID, &rj.Title, &rj.Company, &rj.Percentage, &rj.MatchedSkills)
		if err != nil {
			log.Println("Scan error in recommendations:", err)
			continue
		}
		res = append(res, rj)
	}

	if res == nil {
		res = []RecommendedJob{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// ՍԱ ՇԱՏ ԿԱՐԵՎՈՐ Է
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// --- AI Որոնման ֆիլտրեր և ֆունկցիա ---
type SearchFilters struct {
	Keywords string `json:"keywords"`
	Location string `json:"location"`
	Title    string `json:"title"`
	Limit    int    `json:"limit"`
}

func searchJobs(ctx context.Context, filters SearchFilters) ([]Job, error) {
	limit := filters.Limit
	if limit == 0 {
		limit = 20
	}

	keywordToSearch := filters.Keywords
	if keywordToSearch == "" && filters.Title != "" {
		keywordToSearch = filters.Title
	}

	query := `
       SELECT id, title, COALESCE(company, ''), COALESCE(description, ''), COALESCE(location, ''), COALESCE(salary_range, '') 
       FROM jobs 
       WHERE ($1 = '' OR title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
       AND ($2 = '' OR location ILIKE '%' || $2 || '%')
       ORDER BY id DESC LIMIT $3`

	rows, err := db.QueryContext(ctx, query, keywordToSearch, filters.Location, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var j Job
		if err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Description, &j.Location, &j.Salary_Range); err == nil {
			jobs = append(jobs, j)
		}
	}

	if jobs == nil {
		jobs = []Job{}
	}

	return jobs, nil
}
