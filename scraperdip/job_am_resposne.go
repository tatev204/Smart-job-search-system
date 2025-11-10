package main

import (
	"time"
)

type Job_Am struct {
	ID          int       `json:"Id"`
	Title       string    `json:"Title"`
	Company     string    `json:"Company"`
	URL         string    `json:"Url"`
	Logo        string    `json:"Logo"`
	DeadlineRaw string    `json:"DeadLine"`
	Location    string    `json:"Location"`
	IndustryID  int       `json:"IndustryId"`
	IndustryIDs []int     `json:"IndustryIds"`
	Deadline    time.Time `json:"-"` // parsed from DeadlineRaw
}
