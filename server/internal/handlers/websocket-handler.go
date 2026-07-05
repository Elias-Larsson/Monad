package handlers

import (
	"context"
	"encoding/json"
	"monad/internal/workflow"
	"time"

	"github.com/fasthttp/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/valyala/fasthttp"
)

var workflowRunUpgrader = websocket.FastHTTPUpgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(ctx *fasthttp.RequestCtx) bool {
		return true
	},
}

func (h *Handler) WorkflowRunWebSocket(c fiber.Ctx) error {
	if !c.IsWebSocket() {
		return c.Status(fiber.StatusUpgradeRequired).SendString("websocket upgrade required")
	}

	workflowRunID := c.Params("id")
	if workflowRunID == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow run id is required")
	}

	userID, err := requireUserID(c)
	if err != nil {
		return err
	}

	snapshot, err := workflow.GetWorkflowRunSnapshotForUser(
		context.Background(),
		h.pool,
		userID,
		workflowRunID,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).SendString("workflow run not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	initialPayload, err := json.Marshal(snapshot)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	err = workflowRunUpgrader.Upgrade(c.RequestCtx(), func(conn *websocket.Conn) {
		h.streamWorkflowRunUpdates(conn, workflowRunID, initialPayload)
	})
	if err != nil {
		return c.Status(fiber.StatusUpgradeRequired).SendString("websocket upgrade failed")
	}

	return nil
}

func (h *Handler) streamWorkflowRunUpdates(conn *websocket.Conn, workflowRunID string, initialPayload []byte) {
	defer conn.Close()

	updates, unsubscribe := h.hub.Subscribe(workflowRunID)
	defer unsubscribe()

	clientClosed := make(chan struct{})
	go func() {
		defer close(clientClosed)
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}()

	if !writeWebSocketMessage(conn, initialPayload) {
		return
	}

	for {
		select {
		case payload, ok := <-updates:
			if !ok {
				return
			}
			if !writeWebSocketMessage(conn, payload) {
				return
			}
		case <-clientClosed:
			return
		}
	}
}

func writeWebSocketMessage(conn *websocket.Conn, payload []byte) bool {
	if err := conn.SetWriteDeadline(time.Now().Add(5 * time.Second)); err != nil {
		return false
	}

	return conn.WriteMessage(websocket.TextMessage, payload) == nil
}
