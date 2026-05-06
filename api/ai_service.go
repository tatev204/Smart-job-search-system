package api

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

type AIResult struct {
	ExtractedSkills []string `json:"extracted_skills"`
	Summary         string   `json:"summary"`
	ExperienceLevel string   `json:"experience_level"`
	Profession      string   `json:"profession"`
}

func ProcessWithAI(ctx context.Context, cvText string) (*AIResult, error) {
	llm, err := openai.New(
		// ՃԻՇՏ տարբերակը. միայն base URL-ը
		openai.WithBaseURL("https://diploma-openai.openai.azure.com/"),
		openai.WithToken("2NustDEYdO8rwhXOypSYyFQa9EpAg3mOdJIYeKV23WKPS0ANcSj6JQQJ99CEACfhMk5XJ3w3AAABACOG9dkm"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("gpt-4o"), // Սա ձեր Deployment Name-ն է
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	if err != nil {
		return nil, err
	}

	prompt := "Analyze this CV and return ONLY a JSON object with keys: extracted_skills (list), summary (string), experience_level (string), profession (string). CV TEXT: " + cvText

	resp, err := llm.Call(ctx, prompt, llms.WithTemperature(0.1))
	if err != nil {
		// Եթե այստեղ սխալ կա, այն կերևա քո Go տերմինալում
		fmt.Println("AZURE CALL ERROR:", err)
		return nil, err
	}

	// Մաքրում ենք JSON-ը հնարավոր markdown-ից
	cleanJSON := strings.TrimSpace(resp)
	cleanJSON = strings.TrimPrefix(cleanJSON, "```json")
	cleanJSON = strings.TrimSuffix(cleanJSON, "```")
	cleanJSON = strings.TrimSpace(cleanJSON)

	var result AIResult
	if err := json.Unmarshal([]byte(cleanJSON), &result); err != nil {
		fmt.Println("JSON UNMARSHAL ERROR:", err, "RAW RESP:", resp)
		return nil, err
	}

	return &result, nil
}
