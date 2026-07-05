package main

import (
	"context"
	"log"
	"os"
	"time"

	routes "monad/internal/api"
	"monad/internal/realtime"
	"monad/internal/workflow"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := workflow.NewPostgres(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err := workflow.EnsureSchema(context.Background(), pool); err != nil {
		log.Fatal(err)
	}

	hub := realtime.NewHub()
	go func() {
		for {
			if err := realtime.ListenPostgres(ctx, pool, hub); err != nil {
				log.Printf("realtime listener stopped: %v", err)
			}
			if ctx.Err() != nil {
				return
			}
			time.Sleep(2 * time.Second)
		}
	}()

	routes.Setup(app, pool, hub)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}
