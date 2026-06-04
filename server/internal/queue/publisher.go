package queue

import (
	"context"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func Publish(body []byte) error {
	conn, err := amqp.Dial(rabbitMQURL())
	if err != nil {
		return err
	}
	defer conn.Close()

	channel, err := conn.Channel()
	if err != nil {
		return err
	}
	defer channel.Close()

	q, err := channel.QueueDeclare(
		queueName(),
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	return channel.PublishWithContext(
		context.Background(),
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now(),
		},
	)
}
