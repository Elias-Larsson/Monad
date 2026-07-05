package handlers

import (
	"context"
	"encoding/json"
	"monad/internal/auth"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authUserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type loginResponse struct {
	User authUserResponse `json:"user"`
}

func (h *Handler) UserCreate(c fiber.Ctx) error {
	var r authRequest

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	r.Email = strings.TrimSpace(strings.ToLower(r.Email))
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

	tag, err := h.pool.Exec(
		context.Background(),
		`
		INSERT INTO users (
			id,
			email,
			password_hash
		)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO NOTHING
		`,
		userID,
		r.Email,
		passwordHash,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusConflict).SendString("user with this email already exists")
	}

	return c.Status(fiber.StatusCreated).JSON(authUserResponse{
		ID:    userID,
		Email: r.Email,
	})
}

func (h *Handler) Login(c fiber.Ctx) error {
	var r authRequest

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	r.Email = strings.TrimSpace(strings.ToLower(r.Email))
	if r.Email == "" || r.Password == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Email or password missing")
	}

	var userID string
	var passwordHash string
	err := h.pool.QueryRow(
		context.Background(),
		`
		SELECT
			id,
			password_hash
		FROM users
		WHERE email = $1
		`,
		r.Email,
	).Scan(
		&userID,
		&passwordHash,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusUnauthorized).SendString("Bad password or email")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	if err := auth.CheckPassword(passwordHash, r.Password); err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("Bad password or email")
	}

	token, err := auth.GenerateToken(userID, r.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    token,
		Path:     "/",
		HTTPOnly: true,
		Secure:   false, // true in production HTTPS
		SameSite: "Lax",
		Expires:  time.Now().Add(24 * time.Hour),
	})

	return c.Status(fiber.StatusOK).JSON(loginResponse{
		User: authUserResponse{
			ID:    userID,
			Email: r.Email,
		},
	})
}
