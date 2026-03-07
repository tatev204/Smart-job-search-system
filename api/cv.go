package api

//
//import (
//	"bytes"
//	"context"
//	"database/sql"
//	"encoding/json"
//	"fmt"
//	"io"
//	"net/http"
//	"strings"
//	"time"
//
//	"github.com/dslipak/pdf"
//	"github.com/lib/pq"
//)
//
//// ExtractTextFromPDF կարդում է PDF-ի պարունակությունը
//func ExtractTextFromPDF(f io.ReaderAt, size int64) (string, error) {
//	r, err := pdf.NewReader(f, size)
//	if err != nil {
//		return "", err
//	}
//
//	var buf bytes.Buffer
//	b, err := r.GetPlainText()
//	if err != nil {
//		return "", err
//	}
//
//	buf.ReadFrom(b)
//	return buf.String(), nil
//}
//
//// MatchSkillsAndGetJobs գտնում է հմտությունները տեքստում և վերադարձնում աշխատանքները
//func MatchSkillsAndGetJobs(db *sql.DB, cvText string) ([]string, error) {
//	// 1. Վերցնում ենք բոլոր հմտությունները բազայից
//	rows, err := db.Query("SELECT name FROM skills")
//	if err != nil {
//		return nil, err
//	}
//	defer rows.Close()
//
//	var foundSkills []string
//	cvTextLower := strings.ToLower(cvText)
//
//	for rows.Next() {
//		var skillName string
//		if err := rows.Scan(&skillName); err != nil {
//			continue
//		}
//		// Ստուգում ենք՝ արդյոք հմտությունը կա տեքստում
//		if strings.Contains(cvTextLower, strings.ToLower(skillName)) {
//			foundSkills = append(foundSkills, skillName)
//		}
//	}
//
//	if len(foundSkills) == 0 {
//		return []string{"Համապատասխան հմտություններ չեն գտնվել"}, nil
//	}
//
//	// 2. Գտնում ենք աշխատանքները ըստ գտնված հմտությունների
//	query := `
//        SELECT DISTINCT j.title
//        FROM jobs j
//        JOIN job_skills js ON j.id = js.job_id
//        JOIN skills s ON js.skill_id = s.id
//        WHERE s.name = ANY($1)`
//
//	jobRows, err := db.Query(query, pq.Array(foundSkills))
//	if err != nil {
//		return nil, err
//	}
//	defer jobRows.Close()
//
//	var recommendedJobs []string
//	for jobRows.Next() {
//		var jobTitle string
//		if err := jobRows.Scan(&jobTitle); err != nil {
//			continue
//		}
//		recommendedJobs = append(recommendedJobs, jobTitle)
//	}
//
//	return recommendedJobs, nil
//}
//
//// UploadResumeHandler հիմնական Handler-ն է
//func UploadResumeHandler(w http.ResponseWriter, r *http.Request) {
//	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
//	defer cancel()
//
//	if err := r.ParseMultipartForm(10 << 20); err != nil {
//		http.Error(w, "Ֆայլի չափսը չափազանց մեծ է", http.StatusBadRequest)
//		return
//	}
//
//	file, _, err := r.FormFile("resume")
//	if err != nil {
//		http.Error(w, "Ֆայլը չի գտնվել (Key-ը պետք է լինի 'resume')", http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	done := make(chan struct{})
//	var content string
//	var extractErr error
//
//	go func() {
//		fileBytes, err := io.ReadAll(file)
//		if err != nil {
//			extractErr = err
//			close(done)
//			return
//		}
//
//		readerAt := bytes.NewReader(fileBytes)
//		content, extractErr = ExtractTextFromPDF(readerAt, int64(len(fileBytes)))
//		close(done)
//	}()
//
//	select {
//	case <-ctx.Done():
//		http.Error(w, "Timeout: Գործողությունը չափից ավելի երկար տևեց", http.StatusRequestTimeout)
//		return
//	case <-done:
//		if extractErr != nil {
//			http.Error(w, "PDF կարդալու սխալ: "+extractErr.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	// Կանչում ենք համեմատման ֆունկցիան
//	jobs, err := MatchSkillsAndGetJobs(db, content) // Համոզվիր, որ 'db'-ն հասանելի է այստեղ
//	if err != nil {
//		fmt.Println("Matching Error:", err)
//		http.Error(w, "Բազայի հետ համեմատման սխալ", http.StatusInternalServerError)
//		return
//	}
//
//	w.Header().Set("Content-Type", "application/json; charset=utf-8")
//	response := map[string]interface{}{
//		"status":           "success",
//		"recommended_jobs": jobs,
//	}
//
//	json.NewEncoder(w).Encode(response)
//}
