package main

import (
	"database/sql"
	"log"
	"os"
	"sync"

	"api"        // Փոխվեց այստեղ (պետք է համընկնի api/go.mod-ի անվան հետ)
	"scraperdip" // Փոխվեց այստեղ (պետք է համընկնի scraperdip/go.mod-ի հետ)

	_ "github.com/lib/pq"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:tatev1234@localhost:5432/JobDB?sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("DB connection error:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("DB ping error:", err)
	}

	// Այս տողը կարևոր է, որ api-ն տեսնի բազան
	api.InitDB(db)

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		log.Println("🚀 Starting API on :8088...")
		api.StartAPI(db)
	}()

	go func() {
		defer wg.Done()
		log.Println("🕵️ Starting Scraper on :8070...")
		scraperdip.StartScraper()
	}()

	log.Println("✅ All services are running.")
	wg.Wait()
}
