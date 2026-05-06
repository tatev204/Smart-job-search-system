package scraperdip

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	dbPkg "scraperdip/db"

	"github.com/chromedp/chromedp"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

const chromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const yandexPath = `C:\Users\aniar\AppData\Local\Yandex\YandexBrowser\Application\browser.exe`

type Skill struct {
	ID   int
	Name string
}

// ՈՒՂՂՈՒՄ 1. Ստրուկտուրայի մեջ ավելացվել են CompaniesStruct և JobCity դաշտերը
type StaffAmResponse struct {
	PageProps struct {
		Jobs []struct {
			ID    int `json:"id"`
			Title struct {
				En string `json:"en"`
			} `json:"title"`
			Intro      string `json:"intro"`
			SalaryText string `json:"salary_text"`
			Slug       struct {
				En string `json:"en"`
			} `json:"slug"`
			CompaniesStruct struct {
				Title struct {
					En string `json:"en"`
				} `json:"title"`
			} `json:"companies_struct"`
			JobCity struct {
				Title struct {
					En string `json:"en"`
				} `json:"title"`
			} `json:"job_city"`
		} `json:"jobs"`
	} `json:"pageProps"`
}

func StartScraper() {
	ctx := context.Background()
	dbPkg.Init(ctx)
	pool := dbPkg.Get()

	// Cron աշխատանքը ժամանակացույցով
	staffMakeUpdate()

	http.HandleFunc("/search", staffSearchHandler(pool))

	// ՆՈՐ: Ձեռքով միացնելու Endpoint (որպեսզի անընդհատ չաշխատի)
	http.HandleFunc("/trigger-scraper", func(w http.ResponseWriter, r *http.Request) {
		go staffRunScrape(context.Background(), pool)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "Scraping started in background"}`))
	})

	fmt.Println("🚀 Scraper & API listening on :8070")
	http.ListenAndServe(":8070", nil)
}

func staffRunScrape(ctx context.Context, pool *pgxpool.Pool) {
	fmt.Println("🔍 Starting Scrape (Advanced Text Extraction)...")

	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.ExecPath(yandexPath),
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-blink-features", "AutomationControlled"),
		chromedp.UserAgent(chromeUA),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()
	browserCtx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	var htmlContent string
	chromedp.Run(browserCtx,
		chromedp.Navigate("https://staff.am/en/jobs"),
		chromedp.WaitVisible(`body`, chromedp.ByQuery),
		chromedp.Sleep(5*time.Second),
		chromedp.OuterHTML(`html`, &htmlContent),
	)

	buildID := extractBuildID(htmlContent)
	if buildID == "" {
		return
	}

	allSkills := getAllSkills(ctx, pool)

	for page := 1; page <= 5; page++ {
		url := fmt.Sprintf("https://staff.am/_next/data/%s/en/jobs.json?page=%d", buildID, page)
		var jsonBody string
		chromedp.Run(browserCtx,
			chromedp.Evaluate(`fetch("`+url+`").then(r => r.json()).then(j => { window.tempData = JSON.stringify(j); })`, nil),
			chromedp.Sleep(3*time.Second),
			chromedp.Evaluate(`window.tempData`, &jsonBody),
		)

		var data StaffAmResponse
		json.Unmarshal([]byte(jsonBody), &data)

		for _, job := range data.PageProps.Jobs {
			slug := job.Slug.En
			if slug == "" {
				continue
			}
			jobURL := "https://staff.am/en/job/" + slug
			var fullDesc, pageFullText string

			fmt.Printf("🕵️ Deep Scraping: %s\n", slug)

			// ՈՒՂՂՈՒՄ 2. Ընկերության և քաղաքի անունները վերցնում ենք անմիջապես JSON-ից
			companyName := job.CompaniesStruct.Title.En
			if companyName == "" {
				companyName = "Staff.am Partner"
			}

			location := job.JobCity.Title.En
			if location == "" {
				location = "Armenia"
			}

			tabCtx, tabCancel := chromedp.NewContext(browserCtx)
			taskCtx, taskCancel := context.WithTimeout(tabCtx, 25*time.Second)

			err := chromedp.Run(taskCtx,
				chromedp.Navigate(jobURL),
				chromedp.Sleep(5*time.Second), // Սպասում ենք, որ էջը լավ բեռնվի

				// ՓՈՐՁՈՒՄ ԵՆՔ ԳՏՆԵԼ ԸՆԿԵՐՈՒԹՅԱՆ ԱՆՈՒՆԸ HTML-ԻՑ
				chromedp.Evaluate(`
					(() => {
						let comp = "";
						let c1 = document.querySelector('.job-post-company-title a');
						let c2 = document.querySelector('.job-post-company-name');
						if (c1) comp = c1.innerText.trim();
						else if (c2) comp = c2.innerText.trim();
						if (!comp) {
							let t = document.title;
							if (t.includes("at ")) comp = t.split("at ")[1].split("|")[0].trim();
						}
						return comp;
					})()
				`, &companyName),

				// ՆՈՐ ԵՎ ԱՄԵՆԱԱՊԱՀՈՎ ՏԱՐԲԵՐԱԿԸ ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ ՔԱՇԵԼՈՒ ՀԱՄԱՐ
				chromedp.Evaluate(`
					(() => {
						// Տարբերակ 1: Ստանդարտ Staff.am դիզայն
						let mainDesc = document.querySelector('#job-description');
						if (mainDesc && mainDesc.innerText.trim().length > 50) {
							return mainDesc.innerHTML.trim(); // Վերցնում ենք HTML-ով, որ դիզայնը մնա
						}
						
						// Տարբերակ 2: Եթե #job-description չկա, գտնում ենք մնացած կլասները
						let selectors = ['.job-post-description', '.job-details-content', '.job_post_content', '.job-inner', '.hs_cos_wrapper_type_rich_text'];
						for (let s of selectors) {
							let el = document.querySelector(s);
							if (el && el.innerText.trim().length > 50) {
								return el.innerHTML.trim();
							}
						}
						
						// Տարբերակ 3 (Ծայրահեղ դեպք): Վերցնում ենք էջի ամբողջ տեքստը ու ձեռքով կտրում
						let fullBody = document.body.innerText;
						let startWords = ["Job Description:", "Աշխատանքի նկարագրություն:", "Job responsibilities:"];
						let startIndex = -1;
						for (let word of startWords) {
							let idx = fullBody.indexOf(word);
							if (idx !== -1) {
								startIndex = idx;
								break;
							}
						}
						
						if (startIndex !== -1) {
							// Կտրում ենք տեքստի սկզբի աղբը
							let cleanText = fullBody.substring(startIndex);
							// Փորձում ենք կտրել նաև վերջի աղբը
							let endIdx = cleanText.indexOf("Apply Now");
							if (endIdx !== -1) cleanText = cleanText.substring(0, endIdx);
							return cleanText.trim();
						}

						return ""; 
					})()
				`, &fullDesc),

				chromedp.Evaluate(`document.body.innerText`, &pageFullText),
			)

			taskCancel()
			tabCancel()

			if err != nil {
				fmt.Printf("⚠️ Timeout or Error scraping details for: %s\n", slug)
			}

			phoneNumber := extractPhones(pageFullText)

			query := `
			INSERT INTO jobs (job_id, title, company, description, full_description, source_url, source_platform, location, salary_range, phone_number, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
			ON CONFLICT (job_id, source_platform)
			DO UPDATE SET
				company = EXCLUDED.company,
				location = EXCLUDED.location,
				salary_range = EXCLUDED.salary_range,
				full_description = EXCLUDED.full_description,
				description = EXCLUDED.description,
				phone_number = EXCLUDED.phone_number`

			// ՈՒՂՂՈՒՄ 4. Ճիշտ փոխանցում ենք location և job.SalaryText փոփոխականները SQL-ին
			pool.Exec(ctx, query, job.ID, job.Title.En, companyName, job.Intro, fullDesc, jobURL, "staff.am", location, job.SalaryText, phoneNumber)
			fmt.Printf("✅ Saved Successfully: %s (Desc size: %d, Location: %s, Salary: %s)\n", job.Title.En, len(fullDesc), location, job.SalaryText)

			var internalID int
			pool.QueryRow(ctx, "SELECT id FROM jobs WHERE job_id=$1 AND source_platform='staff.am'", job.ID).Scan(&internalID)
			staffAnalyzeAndLinkSkills(ctx, pool, internalID, fullDesc, allSkills)

			time.Sleep(1 * time.Second)
		}
	}
}

func extractBuildID(html string) string {
	searchStr := "\"buildId\":\""
	idx := strings.Index(html, searchStr)
	if idx == -1 {
		return ""
	}
	start := idx + len(searchStr)
	end := strings.Index(html[start:], "\"")
	return html[start : start+end]
}

func extractPhones(text string) string {
	re := regexp.MustCompile(`(?i)(?:\+374|0)[\s\-]?[1-9]{1}[0-9]{1}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}`)
	matches := re.FindAllString(text, -1)
	if len(matches) == 0 {
		return ""
	}
	unique := make(map[string]bool)
	var res []string
	for _, m := range matches {
		if !unique[m] {
			unique[m] = true
			res = append(res, m)
		}
	}
	return strings.Join(res, ", ")
}

func getAllSkills(ctx context.Context, pool *pgxpool.Pool) []Skill {
	var skills []Skill
	rows, _ := pool.Query(ctx, "SELECT id, name FROM skills")
	defer rows.Close()
	for rows.Next() {
		var s Skill
		rows.Scan(&s.ID, &s.Name)
		skills = append(skills, s)
	}
	return skills
}

func staffAnalyzeAndLinkSkills(ctx context.Context, pool *pgxpool.Pool, jobID int, text string, skills []Skill) {
	lowerText := strings.ToLower(text)
	for _, skill := range skills {
		pattern := fmt.Sprintf(`(?i)\b%s\b`, regexp.QuoteMeta(strings.ToLower(skill.Name)))
		matched, _ := regexp.MatchString(pattern, lowerText)
		if matched {
			pool.Exec(ctx, "INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", jobID, skill.ID)
		}
	}
}

func staffMakeUpdate() {
	c := cron.New()
	c.AddFunc("0 20 * * *", func() { staffRunScrape(context.Background(), dbPkg.Get()) })
	c.Start()
}

func staffSearchHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "Search Active"}`))
	}
}
