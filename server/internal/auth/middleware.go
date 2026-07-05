package auth

import (
	"strings"

	"github.com/gofiber/fiber/v3"
)

func Middleware(c fiber.Ctx) error {
	header := c.Get("Authorization")

	tokenString, ok := strings.CutPrefix(header, "Bearer ")
	if !ok || tokenString == "" {
		tokenString = c.Cookies("access_token")
	}

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).SendString("missing auth token")
	}

	claims, err := ValidateToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("invalid auth token")
	}

	c.Locals("user_id", claims.Subject)
	c.Locals("email", claims.Email)

	return c.Next()
}
