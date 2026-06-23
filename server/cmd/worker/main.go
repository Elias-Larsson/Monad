package main

import (
	"log"

	"monad/internal/queue"
)

func main() {
	log.Println("worker starting")

	if err := queue.Receive(); err != nil {
		log.Fatal(err)
	}
}
