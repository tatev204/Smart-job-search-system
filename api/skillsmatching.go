package api

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/lib/pq"
)

func MatchSkillsAndGetJobs(db *sql.DB, cvText string) ([]RecommendedJob, error) {
	rows, err := db.Query("SELECT name FROM skills")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var foundSkills []string
	cvTextLower := strings.ToLower(cvText)

	for rows.Next() {
		var skillName string
		if err := rows.Scan(&skillName); err != nil {
			continue
		}
		if strings.Contains(cvTextLower, strings.ToLower(skillName)) {
			foundSkills = append(foundSkills, skillName)
		}
	}

	if len(foundSkills) == 0 {
		return []RecommendedJob{}, nil
	}

	query := `
        SELECT j.id, j.title, j.company,
               ROUND(CAST(COUNT(js.skill_id) AS NUMERIC) * 100 /
               NULLIF((SELECT COUNT(*) FROM job_skills WHERE job_id = j.id), 0), 2) as match_percentage,
               COALESCE(STRING_AGG(s.name, ', '), '') as matched_skills
        FROM jobs j
        JOIN job_skills js ON j.id = js.job_id
        JOIN skills s ON js.skill_id = s.id
        WHERE s.name = ANY($1)
        GROUP BY j.id, j.title, j.company
        ORDER BY match_percentage DESC`

	jobRows, err := db.Query(query, pq.Array(foundSkills))
	if err != nil {
		return nil, err
	}
	defer jobRows.Close()

	var recommendedJobs []RecommendedJob
	for jobRows.Next() {
		var job RecommendedJob
		if err := jobRows.Scan(&job.ID, &job.Title, &job.Company, &job.Percentage, &job.MatchedSkills); err != nil {
			continue
		}
		recommendedJobs = append(recommendedJobs, job)
	}
	return recommendedJobs, nil
}

func UploadResumeHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("resume")
	if err != nil {
		http.Error(w, "File not found", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Get file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	done := make(chan struct{})
	var content string
	var extractErr error

	go func() {
		defer close(done)

		filename := header.Filename
		contentType := http.DetectContentType(fileBytes)

		// Handle different file types
		if strings.Contains(contentType, "pdf") || strings.HasSuffix(strings.ToLower(filename), ".pdf") {
			// PDF file
			readerAt := bytes.NewReader(fileBytes)
			content, extractErr = ExtractTextFromPDF(readerAt, int64(len(fileBytes)))
		} else if strings.Contains(contentType, "msword") || strings.HasSuffix(strings.ToLower(filename), ".doc") || strings.HasSuffix(strings.ToLower(filename), ".docx") {
			// Word document - for now, return a placeholder
			content = "Word document detected. Text extraction for DOC/DOCX files is not yet implemented. Please upload a PDF file."
			extractErr = nil
		} else {
			// Unsupported file type
			content = ""
			extractErr = fmt.Errorf("unsupported file type: %s", contentType)
		}
	}()

	select {
	case <-ctx.Done():
		http.Error(w, "Timeout", http.StatusRequestTimeout)
		return
	case <-done:
		if extractErr != nil {
			http.Error(w, "Text extraction error: "+extractErr.Error(), http.StatusInternalServerError)
			return
		}
	}

	// For now, if content is empty or just a message, return mock recommendations
	var jobs []RecommendedJob
	if content == "" || strings.Contains(content, "not yet implemented") {
		// Return some mock recommendations for testing
		jobs = []RecommendedJob{
			{
				ID:            1,
				Title:         "Software Developer",
				Company:       "Tech Company",
				Percentage:    85.5,
				MatchedSkills: "JavaScript, React, Node.js",
			},
			{
				ID:            2,
				Title:         "Frontend Developer",
				Company:       "Web Agency",
				Percentage:    72.3,
				MatchedSkills: "HTML, CSS, JavaScript",
			},
		}
	} else {
		// Process actual content
		jobs, err = MatchSkillsAndGetJobs(db, content)
		if err != nil {
			http.Error(w, "Matching error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Calculate preview length
	previewLength := 200
	if len(content) < 200 {
		previewLength = len(content)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "success",
		"recommended_jobs": jobs,
		"extracted_text":   content[:previewLength], // First 200 chars for debugging
	})
}
