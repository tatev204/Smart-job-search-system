package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"time"
)

func jobAmRequest() {
	resp, err := http.Get("https://job.am/api/jobs")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var jobs []Job_Am
	if err := json.NewDecoder(resp.Body).Decode(&jobs); err != nil {
		panic(err)
	}

	// Parse the .NET-style /Date(1765285777873)/ timestamps
	re := regexp.MustCompile(`/Date\((\d+)\)/`)
	for i := range jobs {
		matches := re.FindStringSubmatch(jobs[i].DeadlineRaw)
		if len(matches) == 2 {
			ms, _ := strconv.ParseInt(matches[1], 10, 64)
			jobs[i].Deadline = time.UnixMilli(ms)
		}
	}

	// Print results
	for _, job := range jobs {
		fmt.Printf("%d | %s | %s | %s | Deadline: %s\n",
			job.ID, job.Title, job.Company, job.Location, job.Deadline.Format("2006-01-02"))
	}
}
