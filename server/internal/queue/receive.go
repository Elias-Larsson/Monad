package queue

import amqp "github.com/rabbitmq/amqp091-go"

func Receive(handle func([]byte) error) error {
	conn, err := amqp.Dial(rabbitMQURL())
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName(), // name
		true,        // durability
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,
	)
	if err != nil {
		return err
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return err
	}

	for d := range msgs {
		err := handle(d.Body)
		if err != nil {
			d.Nack(false, true)
			continue
		}

		d.Ack(false)
	}

	return nil
}
