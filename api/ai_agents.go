package api

import (
	"context"
	"fmt"
	"strings"

	"github.com/tmc/langchaingo/agents"
	"github.com/tmc/langchaingo/chains"
	"github.com/tmc/langchaingo/llms/openai"
	"github.com/tmc/langchaingo/tools"
)

// --- Tools ---

type JobSearchTool struct{}

func (f JobSearchTool) Name() string { return "db_search" }
func (f JobSearchTool) Description() string {
	return "Search for jobs in the database using specific technical keywords or job titles."
}

func (f JobSearchTool) Call(ctx context.Context, input string) (string, error) {
	// Մաքրում ենք input-ը
	cleanInput := strings.Trim(input, "[]\" ")
	parts := strings.Split(cleanInput, ",")
	searchTerm := strings.TrimSpace(parts[0])

	res, err := searchJobs(ctx, SearchFilters{Title: searchTerm, Limit: 10})
	if err != nil {
		return "", err
	}

	if len(res) == 0 {
		return fmt.Sprintf("Observation: No jobs found for keyword '%s'.", searchTerm), nil
	}

	var resultStr string
	for _, job := range res {
		// Հեռացված են ID-ները և ավելորդ նշանները
		resultStr += fmt.Sprintf("Title: %s, Company: %s, Description: %s\n",
			job.Title, job.Company, job.Description)
	}
	return resultStr, nil
}

// --- Agents ---

// RunCVAgent ֆունկցիան
func RunCVAgent(ctx context.Context, aiData *AIResult) (string, error) {
	llm, err := openai.New(
		openai.WithToken("DVfJMbe8O11teCtJxgXkn2v2gJHaf5ENI21D1SIiGUfo94A0QraoJQQJ99CCACYeBjFXJ3w3AAABACOGV3SJ"),
		openai.WithBaseURL("https://jobdb-ai-service.cognitiveservices.azure.com/"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("jobdb-gpt-model"),
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	if err != nil {
		return "", err
	}

	executor, err := agents.Initialize(
		llm,
		[]tools.Tool{JobSearchTool{}},
		agents.ZeroShotReactDescription,
		agents.WithMaxIterations(5),
	)
	if err != nil {
		return "", err
	}

	// Հմտությունների զանգվածը վերածում ենք սովորական տեքստի (օր.՝ "React, Go, Python")
	skillsStr := strings.Join(aiData.ExtractedSkills, ", ")

	// Թարմացված հրահանգ՝ հստակ կանոններով
	instruction := fmt.Sprintf(`
Դու HR խորհրատու ես: Քո նպատակն է թեկնածուի համար գտնել համապատասխան աշխատանք և տալ մաքուր հաշվետվություն հայերենով:

ԹԵԿՆԱԾՈՒԻ ՏՎՅԱԼՆԵՐ:
- Մասնագիտություն: %s
- Հմտություններ: %s

ՔՈ ԳՈՐԾՈՂՈՒԹՅՈՒՆՆԵՐԸ (ԽԻՍՏ ՀԵՏԵՎԻՐ):
1. Օգտագործիր 'db_search' գործիքը ՄԻԱՅՆ մասնագիտության անվանումով (օրինակ՝ "%s"):
2. Համեմատիր գտնված աշխատանքները թեկնածուի հմտությունների հետ:
3. Ներկայացրու գտնված աշխատանքները հայերենով:
4. ԽԻՍՏ ԿԱՆՈՆ: Արդյունքը պետք է լինի ՄԱՔՈՒՐ ՏԵՔՍՏ, գրված պարզ նախադասություններով: ԲԱՑԱՐՁԱԿԱՊԵՍ ՄԻ՛ օգտագործիր աստղանիշներ (**), համարակալումներ (1., 2.), գծիկներ (-), կամ նոր տողի անցումներ: Յուրաքանչյուր աշխատանքի մասին գրիր մեկ անընդմեջ պարբերությամբ:
5. Պատասխանդ սկսիր "Final Answer:" բառերով:

Final Answer: `, aiData.Profession, skillsStr, aiData.Profession)

	return chains.Run(ctx, executor, instruction)
}

func RunElasticSearchAgent(ctx context.Context, query string) (string, error) {
	llm, _ := openai.New(
		openai.WithToken("DVfJMbe8O11teCtJxgXkn2v2gJHaf5ENI21D1SIiGUfo94A0QraoJQQJ99CCACYeBjFXJ3w3AAABACOGV3SJ"),
		openai.WithBaseURL("https://jobdb-ai-service.cognitiveservices.azure.com/"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("jobdb-gpt-model"),
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	executor, _ := agents.Initialize(llm, []tools.Tool{JobSearchTool{}}, agents.ZeroShotReactDescription)

	prompt := fmt.Sprintf(`Փնտրիր աշխատանք հետևյալ հարցումով: %s. 
	
	ՀՐԱՀԱՆԳՆԵՐ:
	1. Պատասխանիր բարեկիրթ հայերենով:
	2. ՄԻ՛ օգտագործիր ID-ներ կամ աստղանիշներ (**):
	3. Տուր պարզ և հասկանալի տեքստ:
	4. Պատասխանդ սկսիր 'Final Answer:' բառով:`, query)

	return chains.Run(ctx, executor, prompt)
}
