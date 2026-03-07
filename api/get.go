package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Թույլատրում ենք քո React ֆրոնտենդին
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Եթե բրաուզերը ուղարկում է OPTIONS (preflight) հարցում, միանգամից պատասխանում ենք OK
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func StartAPI() {
	var err error
	connStr := "user=postgres password=tatev1234 dbname=JobDB sslmode=disable"

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open database connection :%v", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatalf("failed to ping database : %v", err)
	}

	router := mux.NewRouter()

	router.HandleFunc("/users", userRegister).Methods("POST")
	router.HandleFunc("/login", LoginHandler).Methods("POST")
	// Сделано публичным — возвращает список вакансий без авторизации
	router.HandleFunc("/jobs", GetJobsHandler).Methods("GET")
	router.HandleFunc("/skills", AuthMiddleware(GetAllSkillsHandler)).Methods("GET")
	router.HandleFunc("/recommendations", GetRecommendedJobsHandler).Methods("GET")
	router.HandleFunc("/users/skills", AuthMiddleware(AddUserSkillsHandler)).Methods("POST")
	router.HandleFunc("/upload-cv", UploadResumeHandler).Methods("POST")

	port := ":8088"
	fmt.Printf("API Server running on http://localhost%s\n", port)

	log.Fatal(http.ListenAndServe(port, enableCORS(router)))
}
