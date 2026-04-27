package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

func AIUploadHandler(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "PDF extraction failed", http.StatusInternalServerError)
		return
	}

	aiData, err := ProcessWithAI(r.Context(), content)
	if err != nil {
		http.Error(w, "AI extraction error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(aiData)
}

func AICVMatchHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Ստանում ենք օգտատիրոջ ID-ն (AuthMiddleware-ից)
	claims, ok := r.Context().Value(claimsContextKey).(*UserToken)
	if !ok {
		http.Error(w, "Չհաջողվեց նույնականացնել օգտատիրոջը", http.StatusUnauthorized)
		return
	}

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

	// 2. AI ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ
	aiData, err := ProcessWithAI(r.Context(), content)
	if err != nil {
		http.Error(w, "Extraction failed: "+err.Error(), 500)
		return
	}

	// 3. ՊԱՀՈՒՄ ԵՆՔ AI-Ի ԳՏԱԾ ՀՄՏՈՒԹՅՈՒՆՆԵՐԸ ԲԱԶԱՅՈՒՄ (user_skills)
	if len(aiData.ExtractedSkills) > 0 {
		for _, skillName := range aiData.ExtractedSkills {
			var skillID int
			err := db.QueryRow("SELECT id FROM skills WHERE name ILIKE $1 LIMIT 1", skillName).Scan(&skillID)
			if err == nil {
				db.Exec("INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", claims.UserID, skillID)
			}
		}
	}

	// 4. ՍՏԱՆՈՒՄ ԵՆՔ ԳԵՂԵՑԻԿ ՔԱՐՏԵՐԸ՝ ՕԳՏԱԳՈՐԾԵԼՈՎ AI-Ի ՀՄՏՈՒԹՅՈՒՆՆԵՐԸ
	aiSkillsText := strings.Join(aiData.ExtractedSkills, " ")
	jobs, _, _, err := MatchSkillsAndGetJobs(db, aiSkillsText)
	if err != nil {
		http.Error(w, "Matching error: "+err.Error(), 500)
		return
	}

	// Քարտերի ֆորմատավորում տոկոսներով
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
		"ai_summary":       aiData.Summary,    // AI-ի վերլուծած տեքստը
		"ai_profession":    aiData.Profession, // AI-ի գտած մասնագիտությունը
		"recommended_jobs": cleanJobs,         // Գեղեցիկ քարտերը
	})
}

func AIElasticSearchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query is empty", http.StatusBadRequest)
		return
	}
	result, err := RunElasticSearchAgent(r.Context(), query)
	if err != nil {
		http.Error(w, "Search error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"ai_response": result})
}
