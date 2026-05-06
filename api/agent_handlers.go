package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log" // Ավելացված է
	"net/http"
	"strings"
)

func AIUploadHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Ստուգում ենք ֆայլի առկայությունը
	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("resume")
	if err != nil {
		log.Printf("Ֆայլի ստացման սխալ: %v", err)
		http.Error(w, "File not found", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 2. Կարդում ենք ֆայլի պարունակությունը
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Ֆայլը կարդալու սխալ: %v", err)
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// 3. Տեքստի դուրսբերում PDF-ից
	content, err := ExtractTextFromPDF(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		log.Printf("PDF տեքստի դուրսբերման սխալ: %v", err)
		http.Error(w, "PDF extraction failed", http.StatusInternalServerError)
		return
	}

	// 4. AI մշակում
	aiData, err := ProcessWithAI(r.Context(), content)
	if err != nil {
		log.Printf("AI մշակման սխալ: %v", err)
		http.Error(w, "AI extraction error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 5. Աշխատանքների որոնում (որպեսզի ֆրոնտում ցուցակը երևա)
	aiSkillsText := strings.Join(aiData.ExtractedSkills, " ")
	// Եթե հմտություն չկա, փնտրում ենք ըստ մասնագիտության
	if aiSkillsText == "" {
		aiSkillsText = aiData.Profession
	}

	jobs, _, _, err := MatchSkillsAndGetJobs(db, aiSkillsText)
	if err != nil {
		log.Printf("Matching error: %v", err)
		// Սխալի դեպքում ուղարկում ենք դատարկ զանգված, որ ֆրոնտը չկախվի
		jobs = []RecommendedJob{}
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

	// Վերադարձնում ենք այն կառուցվածքը, որին սպասում է UploadResume.tsx-ը
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "success",
		"ai_summary":       aiData.Summary,
		"ai_profession":    aiData.Profession,
		"recommended_jobs": cleanJobs, // Սա կարևոր է ֆրոնտի համար
	})
}

func AICVMatchHandler(w http.ResponseWriter, r *http.Request) {
	type DummyClaim struct{ UserID int }
	claims := &DummyClaim{UserID: 1}

	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("resume")
	if err != nil {
		http.Error(w, "File not found", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileBytes, _ := io.ReadAll(file)
	content, err := ExtractTextFromPDF(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		http.Error(w, "PDF error", http.StatusInternalServerError)
		return
	}

	aiData, err := ProcessWithAI(r.Context(), content)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if len(aiData.ExtractedSkills) > 0 {
		for _, skillName := range aiData.ExtractedSkills {
			var skillID int
			err := db.QueryRow("SELECT id FROM skills WHERE name ILIKE $1 LIMIT 1", skillName).Scan(&skillID)
			if err == nil {
				db.Exec("INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", claims.UserID, skillID)
			}
		}
	}

	aiSkillsText := strings.Join(aiData.ExtractedSkills, " ")
	jobs, _, _, err := MatchSkillsAndGetJobs(db, aiSkillsText)
	if err != nil {
		http.Error(w, "Matching error: "+err.Error(), http.StatusInternalServerError)
		return
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "success",
		"ai_summary":       aiData.Summary,
		"ai_profession":    aiData.Profession,
		"recommended_jobs": cleanJobs,
	})
}

func AIElasticSearchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query is empty", http.StatusBadRequest)
		return
	}

	// Օգտագործում ենք searchJobs ֆունկցիան ուղիղ, որպեսզի ստանանք զանգված
	jobs, err := searchJobs(r.Context(), SearchFilters{Keywords: query, Limit: 10})
	if err != nil {
		http.Error(w, "Search error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"jobs": jobs, // Վերադարձնում ենք աշխատանքների ցուցակը
	})
}
