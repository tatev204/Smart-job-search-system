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

// JobSearchTool կառուցվածքը պետք է լինի ֆունկցիաներից առաջ
type JobSearchTool struct{}

func (f JobSearchTool) Name() string { return "db_search" }
func (f JobSearchTool) Description() string {
	return "Search for jobs in the database using technical keywords."
}

func (f JobSearchTool) Call(ctx context.Context, input string) (string, error) {
	cleanInput := strings.Trim(input, "[]\" ")
	parts := strings.Split(cleanInput, ",")
	searchTerm := strings.TrimSpace(parts[0])

	res, err := searchJobs(ctx, SearchFilters{Title: searchTerm, Limit: 10})
	if err != nil {
		return "", err
	}

	if len(res) == 0 {
		return fmt.Sprintf("Observation: No jobs found for '%s'.", searchTerm), nil
	}

	var resultStr string
	for _, job := range res {
		resultStr += fmt.Sprintf("Title: %s, Company: %s\n", job.Title, job.Company)
	}
	return resultStr, nil
}

// --- Agents ---

func RunCVAgent(ctx context.Context, aiData *AIResult) (string, error) {
	// Azure OpenAI միացում
	llm, err := openai.New(
		openai.WithBaseURL("https://diploma-openai.openai.azure.com/"), // Ուղղված է
		openai.WithToken("2NustDEYdO8rwhXOypSYyFQa9EpAg3mOdJIYeKV23WKPS0ANcSj6JQQJ99CEACfhMk5XJ3w3AAABACOG9dkm"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("gpt-4o"),
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	if err != nil {
		return "", err
	}

	// Օգտագործում ենք JobSearchTool-ը
	jobTool := JobSearchTool{}

	executor, err := agents.Initialize(
		llm,
		[]tools.Tool{jobTool},
		agents.ZeroShotReactDescription,
		agents.WithMaxIterations(5),
	)
	if err != nil {
		return "", err
	}

	skillsStr := strings.Join(aiData.ExtractedSkills, ", ")
	instruction := fmt.Sprintf("Դու HR ես: Գտիր աշխատանք %s մասնագիտությամբ և %s հմտություններով: Պատասխանիր հայերեն: Final Answer: ", aiData.Profession, skillsStr)

	return chains.Run(ctx, executor, instruction)
}

func RunElasticSearchAgent(ctx context.Context, query string) (string, error) {
	llm, err := openai.New(
		// Միայն բազային URL-ը!
		openai.WithBaseURL("https://diploma-openai.openai.azure.com/"),
		openai.WithToken("2NustDEYdO8rwhXOypSYyFQa9EpAg3mOdJIYeKV23WKPS0ANcSj6JQQJ99CEACfhMk5XJ3w3AAABACOG9dkm"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("gpt-4o"), // Քո Deployment Name-ը
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	if err != nil {
		return "", err
	}

	jobTool := JobSearchTool{}
	// Համոզվիր, որ Initialize-ը ստանում է llm-ը և tool-ը
	executor, err := agents.Initialize(llm, []tools.Tool{jobTool}, agents.ZeroShotReactDescription)
	if err != nil {
		return "", err
	}

	prompt := fmt.Sprintf("Փնտրիր աշխատանք: %s. Պատասխանիր հայերեն: Final Answer: ", query)
	return chains.Run(ctx, executor, prompt)
}
