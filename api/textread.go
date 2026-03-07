package api

import (
	"bytes"
	"io"

	"github.com/dslipak/pdf"
)

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

	buf.ReadFrom(b)
	return buf.String(), nil
}
