package api

import (
	"bytes"
	"io"

	"github.com/dslipak/pdf"
)

// ExtractTextFromPDF-ը հասանելի կլինի ամբողջ package-ին
func ExtractTextFromPDF(f io.ReaderAt, size int64) (string, error) {
	r, err := pdf.NewReader(f, size)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	b, err := r.GetPlainText()
	if err != nil {
		return "", err
	}

	_, err = buf.ReadFrom(b)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
