package queue

import "os"

const (
	defaultRabbitMQURL = "amqp://guest:guest@localhost:5672/"
	defaultQueueName   = "workflow_runs"
)

func rabbitMQURL() string {
	if value := os.Getenv("RABBITMQ_URL"); value != "" {
		return value
	}
	return defaultRabbitMQURL
}

func queueName() string {
	if value := os.Getenv("RABBITMQ_QUEUE"); value != "" {
		return value
	}
	return defaultQueueName
}
