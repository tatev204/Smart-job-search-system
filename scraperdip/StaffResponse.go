package main

type StaffJobResponse struct {
	ID       int    `json:"id"`
	Deadline string `json:"deadline"`
	IsRemote bool   `json:"is_remote"`
	Title    struct {
		En string `json:"en"`
		Am string `json:"am"`
	} `json:"title"`
	JobCity struct {
		Title struct {
			En string `json:"en"`
			Am string `json:"am"`
		} `json:"title"`
	} `json:"job_city"`
	CompaniesStruct struct {
		Title struct {
			En string `json:"en"`
			Am string `json:"am"`
		} `json:"title"`
		ProfileImage string `json:"profile_image"`
	} `json:"companiesStruct"`
}

type StaffResponse struct {
	PageProps struct {
		Jobs []StaffJobResponse `json:"jobs"`
	} `json:"pageProps"`
}
