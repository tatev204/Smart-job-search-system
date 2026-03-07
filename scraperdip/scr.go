package scraperdip

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	dbPkg "scraperdip/db"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

func StartScraper() {
	ctx := context.Background()
	dbPkg.Init(ctx)
	defer dbPkg.Close()
	pool := dbPkg.Get()

	cleanExpiredJobs(ctx, pool)
	runScrape(ctx, pool)

	makeUpdate()

	http.HandleFunc("/search", searchHandler(pool))
	fmt.Println("Search API listening on http://localhost:8070/search")
	if err := http.ListenAndServe(":8070", nil); err != nil {
		fmt.Println("server error:", err)
	}
}

func cleanExpiredJobs(ctx context.Context, pool *pgxpool.Pool) {
	query := `DELETE FROM jobs WHERE created_at < CURRENT_DATE`
	_, err := pool.Exec(ctx, query)
	if err != nil {
		fmt.Println("Error cleaning expired jobs:", err)
		return
	}
}

func runScrape(ctx context.Context, pool *pgxpool.Pool) {
	page := 1
	for page >= 1 && page <= 2 {
		page++
		lang := "am"
		url := fmt.Sprintf("https://staff.am/_next/data/AGOOfA7iKkxo09m1N_0Yq/%s/jobs.json?page=%d", lang, page)

		resp, err := http.Get(url)
		if err != nil {
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return
		}

		var data StaffResponse
		if err := json.Unmarshal(body, &data); err != nil {
			return
		}

		makeDbInsertion(ctx, pool, data)
	}
	var jobAm = jobAmRequest()
	makeJobAmDBInsertion(ctx, pool, jobAm)
}

func makeUpdate() {
	c := cron.New()
	_, err := c.AddFunc("0 20 * * *", func() {
		ctx := context.Background()
		pool := dbPkg.Get()
		cleanExpiredJobs(ctx, pool)
		runScrape(ctx, pool)
	})
	if err != nil {
		panic(err)
	}
	c.Start()
}

func analyzeAndLinkSkills(ctx context.Context, pool *pgxpool.Pool, jobID int, textToAnalyze string) {
	rows, err := pool.Query(ctx, "SELECT id, name FROM skills")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var skillID int
		var skillName string
		if err := rows.Scan(&skillID, &skillName); err != nil {
			continue
		}

		lowerText := strings.ToLower(textToAnalyze)
		lowerSkill := strings.ToLower(skillName)

		if strings.Contains(lowerText, lowerSkill) {
			_, _ = pool.Exec(ctx, `
                INSERT INTO job_skills (job_id, skill_id) 
                VALUES ($1, $2) 
                ON CONFLICT DO NOTHING`,
				jobID, skillID)
		}
	}
}

func makeDbInsertion(ctx context.Context, pool *pgxpool.Pool, data StaffResponse) {
	for _, job := range data.PageProps.Jobs {
		var internalID int

		deadline := job.Deadline
		if deadline == "" {
			deadline = time.Now().Format("2006-01-02 15:04:05")
		}
		err := pool.QueryRow(ctx, `
    INSERT INTO jobs
        (job_id, title, company, description, source_url, source_platform, location, salary_range, created_at)
    VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (job_id, source_platform) 
    DO UPDATE SET 
        title = EXCLUDED.title, 
        company = EXCLUDED.company
    RETURNING id
`,
			job.ID, job.Title.En, job.CompaniesStruct.Title.En, job.Title.En,
			"staff.am", "staff.am", job.JobCity.Title.En, "100000", job.Deadline).Scan(&internalID)

		if err == nil {
			analyzeAndLinkSkills(ctx, pool, internalID, job.Title.En)
		} else {
			fmt.Println("Insert error:", err)
		}
	}
}

func makeJobAmDBInsertion(ctx context.Context, pool *pgxpool.Pool, data []Job_Am) {
	for _, job := range data {
		var internalID int
		err := pool.QueryRow(ctx, `
          INSERT INTO jobs
             (job_id, title, company, description, source_url, source_platform, location, salary_range, created_at)
          VALUES
             ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (job_id, source_platform) DO UPDATE 
          SET title = EXCLUDED.title
          RETURNING id
       `,
			job.ID, job.Title, job.Company, job.Title, "job.am", "job.am", job.Location, "100000", job.Deadline,
		).Scan(&internalID)

		if err == nil {
			analyzeAndLinkSkills(ctx, pool, internalID, job.Title)
		} else {
			fmt.Println("Insert error:", err)
		}
	}
}
