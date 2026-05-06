package scraperdip

type StaffResponse struct {
	PageProps struct {
		Jobs []struct {
			ID    int `json:"id"`
			Title struct {
				En string `json:"en"`
			} `json:"title"`
			Slug struct {
				En string `json:"en"`
				Am string `json:"am"`
			} `json:"slug"`
			Deadline interface{} `json:"deadline"`
			// Ավելացնում ենք սա, եթե հանկարծ ապագայում API-ն սկսի տալ այն
			PhoneNumber     string `json:"phone_number"`
			CompaniesStruct struct {
				Title struct {
					En string `json:"en"`
				} `json:"title"`
			} `json:"companies_struct"`
			JobCity struct {
				Title struct {
					En string `json:"en"`
				} `json:"job_city"` // Այստեղ ուղղեցի tag-ը, որ համապատասխանի JSON-ին
			} `json:"job_city"`
		} `json:"jobs"`
	} `json:"pageProps"`
}
