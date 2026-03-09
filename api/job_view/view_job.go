package job_view

import (
	"api"
	"net/http"
)

func ViewJobHandler(w http.ResponseWriter, r *http.Request) {
	api.GetJobHandler(w, r)
}
