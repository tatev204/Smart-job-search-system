package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

// ExtractOnlyTextHandler-ը կանչում է get.go-ում սահմանված ֆունկցիան
func ExtractOnlyTextHandler(w http.ResponseWriter, r *http.Request) {
	// Ֆայլի չափսի սահմանափակում
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Ֆայլը չափազանց մեծ է", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("resume")
	if err != nil {
		http.Error(w, "Ֆայլը չի գտնվել", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Ֆայլը կարդալու սխալ", http.StatusInternalServerError)
		return
	}

	// ՈՒՇԱԴՐՈՒԹՅՈՒՆ. Այստեղ մենք կանչում ենք get.go-ի ֆունկցիան
	text, err := ExtractTextFromPDF(bytes.NewReader(fileBytes), int64(len(fileBytes)))

	if err != nil {
		http.Error(w, "PDF տեքստի վերածման սխալ", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"extracted_text": text,
	})
}
