package api

import (
	"database/sql"
	"fmt"
	"log"
	"sync"

	_ "github.com/lib/pq" // PostgreSQL վարորդը
)

var (
	// db-ն հայտարարում ենք այստեղ, որպեսզի api փաթեթի
	// բոլոր ֆայլերը (getapi.go, postapi.go և այլն) տեսնեն այն։
	db   *sql.DB
	once sync.Once
)

// InitDB ֆունկցիան միացնում է բազան միայն մեկ անգամ
func InitDB() {
	once.Do(func() {
		connStr := "postgres://postgres:tatev1234@localhost:5432/JobDB?sslmode=disable"

		var err error
		db, err = sql.Open("postgres", connStr)
		if err != nil {
			log.Fatalf("Չհաջողվեց բացել բազայի կապը: %v", err)
		}

		// Ստուգում ենք՝ արդյոք բազան հասանելի է
		if err = db.Ping(); err != nil {
			log.Fatalf("Բազան անհասանելի է: %v", err)
		}

		fmt.Println("✅ API-ն հաջողությամբ միացավ տվյալների բազային")
	})
}

// GetDB-ն վերադարձնում է բազայի կապը (եթե պետք լինի այլ տեղ օգտագործել)
func GetDB() *sql.DB {
	if db == nil {
		InitDB()
	}
	return db
}
