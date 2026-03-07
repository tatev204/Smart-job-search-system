package scraperdip

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Job struct {
	JobID       int       `json:"job_id"`
	Title       string    `json:"title"`
	Company     string    `json:"company"`
	Location    string    `json:"location"`
	SourceURL   string    `json:"source_url"`
	Source      string    `json:"source_platform"`
	Description string    `json:"description"`
	SalaryRange string    `json:"salary_range"`
	CreatedAt   time.Time `json:"created_at"`
}

type SearchFilters struct {
	Title   string
	Company string
	City    string
	Limit   int
	Offset  int
}

func parseSearchFilters(r *http.Request) SearchFilters {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	title := strings.TrimSpace(r.URL.Query().Get("title"))

	if q != "" {
		if title == "" {
			title = q
		}
	}

	// Pagination defaults
	limit := 20
	offset := 0
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 { // cap to 100
			limit = n
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}

	return SearchFilters{Title: title, Limit: limit, Offset: offset}
}

func searchJobs(ctx context.Context, pool *pgxpool.Pool, f SearchFilters) ([]Job, error) {

	where := make([]string, 0, 3)
	args := make([]any, 0, 5)

	addLike := func(column, value string) {
		if value == "" {
			return
		}
		where = append(where, fmt.Sprintf("%s ILIKE $%d", column, len(args)+1))
		args = append(args, "%"+value+"%")
	}

	addLike("title", f.Title)
	addLike("company", f.Company)
	addLike("location", f.City)

	sql := "SELECT job_id, title, company, location, source_url, source_platform, description, salary_range, created_at FROM jobs"
	if len(where) > 0 {
		sql += " WHERE " + strings.Join(where, " AND ")
	}
	sql += " ORDER BY created_at DESC"
	sql += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, f.Limit, f.Offset)

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	res := make([]Job, 0, f.Limit)
	for rows.Next() {
		var j Job
		if err := rows.Scan(&j.JobID, &j.Title, &j.Company, &j.Location, &j.SourceURL, &j.Source, &j.Description, &j.SalaryRange, &j.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, j)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}
	return res, nil
}

func searchHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			_, _ = w.Write([]byte("method not allowed"))
			return
		}
		ctx := r.Context()
		filters := parseSearchFilters(r)
		results, err := searchJobs(ctx, pool, filters)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		resp := map[string]any{
			"items":  results,
			"limit":  filters.Limit,
			"offset": filters.Offset,
			"count":  len(results),
		}
		_ = json.NewEncoder(w).Encode(resp)
	}
}
