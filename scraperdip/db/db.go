package db

import (
	"context"
	"log"
	"os"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool *pgxpool.Pool
	once sync.Once
)

func Init(ctx context.Context) {
	once.Do(func() {
		dsn := os.Getenv("DATABASE_URL")
		if dsn == "" {

			dsn = "postgres://postgres:tatev1234@localhost:5432/JobDB?sslmode=disable"
		}

		cfg, err := pgxpool.ParseConfig(dsn)
		if err != nil {
			log.Fatalf("failed to parse db config: %v", err)
		}

		p, err := pgxpool.NewWithConfig(ctx, cfg)
		if err != nil {
			log.Fatalf("failed to create db pool: %v", err)
		}
		if err := p.Ping(ctx); err != nil {
			log.Fatalf("database not reachable: %v", err)
		}
		pool = p
	})
}

func Get() *pgxpool.Pool {
	if pool == nil {
		log.Panic("db.Init must be called before db.Get")
	}
	return pool
}

func Close() {
	if pool != nil {
		pool.Close()
	}
}
