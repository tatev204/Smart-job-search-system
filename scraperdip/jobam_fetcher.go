package scraperdip

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func fetchJobAmDescription(jobID int) string {
	// Նախ API-ն
	url := fmt.Sprintf("https://job.am/api/jobs/%d", jobID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err == nil && resp.StatusCode == 200 {
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)

		var detail struct {
			Description string `json:"description"`
			Body        string `json:"body"`
		}
		if json.Unmarshal(body, &detail) == nil {
			if len(detail.Description) > 50 {
				return detail.Description
			}
			if len(detail.Body) > 50 {
				return detail.Body
			}
		}
	}

	// Fallback — HTML
	pageURL := fmt.Sprintf("https://job.am/en/job/%d", jobID)
	req2, _ := http.NewRequest("GET", pageURL, nil)
	req2.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp2, err := http.DefaultClient.Do(req2)
	if err != nil || resp2.StatusCode != 200 {
		return ""
	}
	defer resp2.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp2.Body)
	if err != nil {
		return ""
	}

	for _, sel := range []string{
		".job-description",
		".description-block",
		".vacancy-description",
		"#job-description",
		".content-area",
	} {
		text := strings.TrimSpace(doc.Find(sel).Text())
		if len(text) > 100 {
			return text
		}
	}
	return ""
}
