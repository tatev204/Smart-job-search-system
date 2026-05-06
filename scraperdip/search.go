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
	JobID       int       `json:"id"` // Փոխեցի 'id', որ համապատասխանի ֆրոնտենդին
	Title       string    `json:"title"`
	Company     string    `json:"company"`
	Location    string    `json:"location"`
	SourceURL   string    `json:"source_url"`
	Source      string    `json:"source_platform"`
	Description string    `json:"description"`
	SalaryRange string    `json:"salary_range"`
	CreatedAt   time.Time `json:"created_at"`
	Category    string    `json:"category"`
	Level       string    `json:"level"`
	Type        string    `json:"type"`
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
	company := strings.TrimSpace(r.URL.Query().Get("company"))
	city := strings.TrimSpace(r.URL.Query().Get("location"))

	if q != "" && title == "" {
		title = q
	}

	limit := 20
	offset := 0
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}

	return SearchFilters{Title: title, Company: company, City: city, Limit: limit, Offset: offset}
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

	// SELECT-ի մեջ հստակ դնում ենք 9 հիմնական դաշտերը, որոնք React-ը սպասում է
	sql := `SELECT job_id, title, 
                   COALESCE(company, ''), 
                   COALESCE(location, ''), 
                   COALESCE(description, ''), 
                   COALESCE(salary_range, ''),
                   COALESCE(category, ''), 
                   COALESCE(level, ''), 
                   COALESCE(type, '') 
            FROM jobs`

	if len(where) > 0 {
		sql += " WHERE " + strings.Join(where, " AND ")
	}
	sql += " ORDER BY job_id DESC" // Փոխեցի created_at-ը job_id-ով ավելի ապահով լինելու համար
	sql += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, f.Limit, f.Offset)

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		fmt.Println("❌ SQL Query Error:", err) // Սա կտեսնես տերմինալում
		return nil, err
	}
	defer rows.Close()

	res := make([]Job, 0)
	for rows.Next() {
		var j Job
		// Համոզվիր, որ այստեղ ճիշտ 9 հատ են
		err := rows.Scan(
			&j.JobID, &j.Title, &j.Company, &j.Location,
			&j.Description, &j.SalaryRange,
			&j.Category, &j.Level, &j.Type,
		)
		if err != nil {
			fmt.Println("❌ Scan Error:", err) // Սա կտեսնես տերմինալում
			continue
		}
		res = append(res, j)
	}
	return res, nil
}

func SearchHandler(pool *pgxpool.Pool) http.HandlerFunc { // Դարձրի մեծատառ S, որ հասանելի լինի դրսից
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // CORS
		if r.Method == http.MethodOptions {
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
