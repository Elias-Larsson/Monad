package handlers

import (
	"context"
	"encoding/json"
	"monad/internal/auth"
	"monad/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func (h *Handler) UserCreate(c fiber.Ctx) error {
	var r models.User

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if r.Email == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Email is required")
	}

	if len(r.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).SendString("Password has to be at least 6 characters")
	}

	userID := uuid.New().String()

	passwordHash, err := auth.HashPassword(r.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	_, err = h.pool.Exec(
		context.Background(),
		`
		INSERT INTO users (
			id,
			email,
			password_hash
		)
		VALUES ($1, $2, $3)
		`,
		userID,
		r.Email,
		passwordHash,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":    userID,
		"email": r.Email,
	})
}
