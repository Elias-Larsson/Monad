package realtime

import "sync"

type Hub struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan []byte]struct{}
}

func NewHub() *Hub {
	return &Hub{
		subscribers: make(map[string]map[chan []byte]struct{}),
	}
}

func (h *Hub) Subscribe(workflowRunID string) (<-chan []byte, func()) {
	ch := make(chan []byte, 16)

	h.mu.Lock()
	if h.subscribers[workflowRunID] == nil {
		h.subscribers[workflowRunID] = make(map[chan []byte]struct{})
	}
	h.subscribers[workflowRunID][ch] = struct{}{}
	h.mu.Unlock()

	unsubscribe := func() {
		h.mu.Lock()
		defer h.mu.Unlock()

		if subscribers, ok := h.subscribers[workflowRunID]; ok {
			delete(subscribers, ch)
			if len(subscribers) == 0 {
				delete(h.subscribers, workflowRunID)
			}
		}

		close(ch)
	}

	return ch, unsubscribe
}

func (h *Hub) Broadcast(workflowRunID string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for ch := range h.subscribers[workflowRunID] {
		select {
		case ch <- payload:
		default:
		}
	}
}
