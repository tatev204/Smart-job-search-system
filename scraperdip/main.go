package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	dbPkg "staff_scraper/db"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

func main() {
	ctx := context.Background()
	dbPkg.Init(ctx)
	defer dbPkg.Close()
	pool := dbPkg.Get()

	page := 1
	for page >= 1 && page <= 2 {
		page++
		lang := "am"
		url := fmt.Sprintf("https://staff.am/_next/data/wjWoLYaWeeZJxHHNnq6tj/%s/jobs.json?page=%d", lang, page)

		resp, err := http.Get(url)
		if err != nil {
			fmt.Println("HTTP request error:", err)
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Error reading response:", err)
			return
		}

		var data StaffResponse
		if err := json.Unmarshal(body, &data); err != nil {
			fmt.Println("Error parsing JSON:", err)
			return
		}

		makeDbInsertion(ctx, pool, data)

	}
	var jobAm = jobAmRequest()
	makeJobAmDBInsertion(ctx, pool, jobAm)

	http.HandleFunc("/search", searchHandler(pool))
	fmt.Println("🔎 Search API listening on http://localhost:8080/search")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("server error:", err)
	}
}

func makeUpdate() {
	c := cron.New()

	_, err := c.AddFunc("0 20 * * *", func() {
		fmt.Println("🕗 Starting job sync:", time.Now())

	})
	if err != nil {
		panic(err)
	}

	fmt.Println("✅ Scheduler started, waiting for 20:00...")
	c.Start()

	select {} // keep progra
	// m running forever
}

func makeDbInsertion(ctx context.Context, pool *pgxpool.Pool, data StaffResponse) {
	for _, job := range data.PageProps.Jobs {
		_, err := pool.Exec(ctx, `
			INSERT INTO jobs
				(job_id, title, company, description, source_url, source_platform, location, salary_range, is_analyzed, search_vector, created_at)
			VALUES
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			ON CONFLICT (job_id, source_platform) DO UPDATE  -- <-- Այս տողն է ավելացվել
          SET
             title = EXCLUDED.title,
             company = EXCLUDED.company,
             description = EXCLUDED.description,
             location = EXCLUDED.location
		`,
			job.ID,
			job.Title.En,
			job.CompaniesStruct.Title.En,
			job.Title.En,
			"staff.am",
			"staff.am",
			job.JobCity.Title.En,
			"100000",
			false,
			"sd",
			job.Deadline,
		)
		if err != nil {
			fmt.Println("Insert error:", err)
			continue
		}
		fmt.Printf("✅ Added job: %s at %s\n", job.Title.En, job.CompaniesStruct.Title.En)
	}
}

func makeJobAmDBInsertion(ctx context.Context, pool *pgxpool.Pool, data []Job_Am) {
	for _, job := range data {
		_, err := pool.Exec(ctx, `
			INSERT INTO jobs
				(job_id, title, company, description, source_url, source_platform, location, salary_range, is_analyzed, search_vector, created_at)
			VALUES
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`,
			job.ID,
			job.Title,
			job.Company,
			job.Title,
			"job.am",
			"job.am",
			job.Location,
			"100000",
			false,
			"sd",
			job.Deadline,
		)
		if err != nil {
			fmt.Println("Insert error:", err)
			continue
		}
		fmt.Printf("✅ Added job: %s at %s\n", job.Title, job.Company)
	}
}
