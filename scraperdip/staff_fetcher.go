package scraperdip

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func fetchStaffDescription(jobID int) string {
	url := fmt.Sprintf(
		"https://staff.am/_next/data//mqCkBIb-VL2z5iraMVP8w/en/jobs/%d.json?id=%d",
		jobID, jobID,
	)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Referer", "https://staff.am/")

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("Staff detail fetch failed for job %d\n", jobID)
		return ""
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var detail struct {
		PageProps struct {
			Job struct {
				Description struct {
					En string `json:"en"`
				} `json:"description"`
				Requirements struct {
					En string `json:"en"`
				} `json:"requirements"`
			} `json:"job"`
		} `json:"pageProps"`
	}

	if err := json.Unmarshal(body, &detail); err != nil {
		return ""
	}

	desc := detail.PageProps.Job.Description.En
	reqs := detail.PageProps.Job.Requirements.En
	if reqs != "" {
		desc += "\n\nRequirements:\n" + reqs
	}

	if len(desc) < 50 {
		return ""
	}
	return desc
}
