package main

import (
	"context"
	"log"
	"os"

	routes "monad/internal/api"
	"monad/internal/workflow"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())
	pool, err := workflow.NewPostgres(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err := workflow.EnsureSchema(context.Background(), pool); err != nil {
		log.Fatal(err)
	}
	routes.Setup(app, pool)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}
