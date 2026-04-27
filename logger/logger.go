package logger

import (
	"fmt"
	"io"
	"log"
	"os"
)

func Init() {
	logFile, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
		return
	}

	multiWriter := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(multiWriter)
	log.SetFlags(log.Ldate | timeFlags() | log.Lshortfile)
}

func timeFlags() int {
	return log.Ltime | log.Lmicroseconds
}
