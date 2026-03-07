package main

import (
	"api"
	"log"
	"scraperdip"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		log.Println("Starting API on :8088...")
		api.StartAPI()
	}()

	go func() {
		defer wg.Done()
		log.Println("Starting Scraper on :8080...")
		scraperdip.StartScraper()
	}()

	log.Println(" All services are running.")
	wg.Wait()
}
