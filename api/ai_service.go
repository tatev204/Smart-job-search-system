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
		openai.WithToken("DVfJMbe8O11teCtJxgXkn2v2gJHaf5ENI21D1SIiGUfo94A0QraoJQQJ99CCACYeBjFXJ3w3AAABACOGV3SJ"),
		openai.WithBaseURL("https://jobdb-ai-service.cognitiveservices.azure.com/"),
		openai.WithAPIType(openai.APITypeAzure),
		openai.WithModel("jobdb-gpt-model"),
		openai.WithAPIVersion("2024-12-01-preview"),
	)
	if err != nil {
		return nil, err
	}

	prompt := fmt.Sprintf(`
       Դու բարձրակարգ տեխնիկական HR մասնագետ ես: Վերլուծիր այս CV-ն և վերադարձրու ՄԻԱՅՆ JSON օբյեկտ:
       
       ՔՈ ԽՆԴԻՐՆԵՐԸ:
       1. Որոշիր թեկնածուի հստակ մասնագիտությունը (Profession):
       2. Առանձնացրու ՄԻԱՅՆ մասնագիտական/տեխնիկական հմտությունները (ExtractedSkills):
       3. Գրիր կարճ մասնագիտական ամփոփում (Summary):

       CV ՏԵՔՍՏ: %s

       JSON-ի ԿԱՌՈՒՑՎԱԾՔԸ:
       {
         "profession": "օրինակ՝ Software Engineer",
         "extracted_skills": ["Go", "Python", "Docker"],
         "summary": "հակիրճ նկարագիր հայերենով",
         "experience_level": "Junior/Mid/Senior"
       }`, cvText)

	resp, err := llm.Call(ctx, prompt, llms.WithTemperature(0.1))
	if err != nil {
		return nil, err
	}

	cleanJSON := strings.TrimSpace(resp)
	cleanJSON = strings.TrimPrefix(cleanJSON, "```json")
	cleanJSON = strings.TrimSuffix(cleanJSON, "```")
	cleanJSON = strings.TrimSpace(cleanJSON)

	var result AIResult
	if err := json.Unmarshal([]byte(cleanJSON), &result); err != nil {
		return nil, fmt.Errorf("JSON parsing error: %v", err)
	}

	return &result, nil
}
