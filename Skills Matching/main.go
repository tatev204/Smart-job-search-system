package main

//
//import (
//	"database/sql"
//	"fmt"
//	"log"
//	"net/http"
//
//	"github.com/gorilla/mux"
//	_ "github.com/lib/pq"
//)
//
//var db *sql.DB
//
//func main() {
//	var err error
//
//	connStr := "user=postgres password=tatev1234 dbname=JobDB sslmode=disable"
//
//	db, err = sql.Open("postgres", connStr)
//	if err != nil {
//		log.Fatalf("Error connecting to database: %v", err)
//	}
//
//	if err = db.Ping(); err != nil {
//		log.Fatalf("The database is unavailable.: %v", err)
//	}
//	log.Println("successfully connected to PostgreSQL")
//	defer db.Close()
//
//	router := mux.NewRouter()
//
//	router.HandleFunc("/recommendations", GetRecommendationsHandler).Methods("GET")
//
//	port := ":9094"
//	fmt.Printf("The server is running. http://localhost%s \n", port)
//	log.Fatal(http.ListenAndServe(port, router))
//}
