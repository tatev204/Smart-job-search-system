package getapi

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

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
	router.HandleFunc("/jobs", AuthMiddleware(GetJobsHandler)).Methods("GET")
	router.HandleFunc("/skills", AuthMiddleware(GetAllSkillsHandler)).Methods("GET")
	router.HandleFunc("/recommendations", GetRecommendedJobsHandler).Methods("GET")
	router.HandleFunc("/users/skills", AuthMiddleware(AddUserSkillsHandler)).Methods("POST")

	port := ":8088"
	fmt.Printf("API Server running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}
