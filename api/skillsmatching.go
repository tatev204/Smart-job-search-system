package api

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/lib/pq"
)

// MatchSkillsAndGetJobs - Որոնում է հմտությունները թե՛ բազայի կապերով, թե՛ տեքստային նկարագրության մեջ
func MatchSkillsAndGetJobs(db *sql.DB, cvText string) ([]RecommendedJob, []int, []string, error) {
	rows, err := db.Query("SELECT id, name FROM skills")
	if err != nil {
		return nil, nil, nil, fmt.Errorf("database query error: %v", err)
	}
	defer rows.Close()

	var foundSkills []string
	var foundSkillIDs []int
	cvTextLower := strings.ToLower(cvText)

	for rows.Next() {
		var skillID int
		var skillName string
		if err := rows.Scan(&skillID, &skillName); err != nil {
			continue
		}

		pattern := fmt.Sprintf(`(?i)\b%s\b`, regexp.QuoteMeta(strings.ToLower(skillName)))
		matched, _ := regexp.MatchString(pattern, cvTextLower)

		if matched {
			foundSkills = append(foundSkills, skillName)
			foundSkillIDs = append(foundSkillIDs, skillID)
		}
	}

	if len(foundSkills) == 0 {
		return []RecommendedJob{}, []int{}, []string{}, nil
	}

	// ՈՒՂՂՎԱԾ SQL ՀԱՐՑՈՒՄ: Օգտագործում ենք ~* և '\y' միայն ամբողջական բառերը գտնելու համար
	query := `
		SELECT DISTINCT j.id, j.title, j.company,
			(
				SELECT COUNT(*) 
				FROM unnest($1::text[]) s_name 
				WHERE j.title ~* ('\y' || s_name || '\y') 
				   OR j.description ~* ('\y' || s_name || '\y')
			) as matched_count,
			(
				SELECT STRING_AGG(s_name, ', ') 
				FROM unnest($1::text[]) s_name 
				WHERE j.title ~* ('\y' || s_name || '\y') 
				   OR j.description ~* ('\y' || s_name || '\y')
			) as matched_skills_list
		FROM jobs j
		WHERE EXISTS (
			SELECT 1 FROM unnest($1::text[]) s_name 
			WHERE j.title ~* ('\y' || s_name || '\y') 
			   OR j.description ~* ('\y' || s_name || '\y')
		)
		ORDER BY matched_count DESC
		LIMIT 50`

	jobRows, err := db.Query(query, pq.Array(foundSkills))
	if err != nil {
		return nil, nil, nil, fmt.Errorf("job search query error: %v", err)
	}
	defer jobRows.Close()

	var recommendedJobs []RecommendedJob
	for jobRows.Next() {
		var job RecommendedJob
		var matchedCount int
		if err := jobRows.Scan(&job.ID, &job.Title, &job.Company, &matchedCount, &job.MatchedSkills); err != nil {
			continue
		}

		if len(foundSkills) > 0 {
			job.Percentage = float64(matchedCount) / float64(len(foundSkills)) * 100
		}
		recommendedJobs = append(recommendedJobs, job)
	}

	return recommendedJobs, foundSkillIDs, foundSkills, nil
}

func UploadResumeHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Ստանում ենք օգտատիրոջ ID-ն
	claims, ok := r.Context().Value(claimsContextKey).(*UserToken)
	if !ok {
		http.Error(w, "Չհաջողվեց նույնականացնել օգտատիրոջը", http.StatusUnauthorized)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("resume")
	if err != nil {
		http.Error(w, "File not found", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	content, err := ExtractTextFromPDF(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		http.Error(w, "PDF extraction failed", http.StatusInternalServerError)
		return
	}

	jobs, foundSkillIDs, matchedNames, err := MatchSkillsAndGetJobs(db, content)
	if err != nil {
		http.Error(w, "Matching failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. ՊԱՀՈՒՄ ԵՆՔ ՀՄՏՈՒԹՅՈՒՆՆԵՐԸ ԲԱԶԱՅՈՒՄ
	for _, skillID := range foundSkillIDs {
		db.Exec("INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", claims.UserID, skillID)
	}

	var cleanJobs []map[string]interface{}
	for _, j := range jobs {
		cleanJobs = append(cleanJobs, map[string]interface{}{
			"id":               j.ID,
			"title":            j.Title,
			"company":          j.Company,
			"match_percentage": fmt.Sprintf("%.0f%%", j.Percentage),
			"matched_skills":   j.MatchedSkills,
		})
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "success",
		"total_jobs_found": len(cleanJobs),
		"all_skills_in_cv": matchedNames,
		"recommended_jobs": cleanJobs,
	})
}
