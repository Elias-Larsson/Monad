package routes

import "github.com/gofiber/fiber/v3"

func Setup(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", func(c fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

}
