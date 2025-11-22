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

// Init initializes the global connection pool once. Call early in main.
func Init(ctx context.Context) {
	once.Do(func() {
		dsn := os.Getenv("DATABASE_URL")
		if dsn == "" {
			// Fallback for local development; prefer DATABASE_URL in production.
			dsn = "postgres://postgres:tatev1234@localhost:5432/JobDB?sslmode=disable"
		}

		cfg, err := pgxpool.ParseConfig(dsn)
		if err != nil {
			log.Fatalf("failed to parse db config: %v", err)
		}
		// Optional pool tuning examples:
		// cfg.MaxConns = 10
		// cfg.MinConns = 1

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

// Get returns the initialized pool. Ensure Init was called.
func Get() *pgxpool.Pool {
	if pool == nil {
		log.Panic("db.Init must be called before db.Get")
	}
	return pool
}

// Close closes the pool; call on application shutdown.
func Close() {
	if pool != nil {
		pool.Close()
	}
}
