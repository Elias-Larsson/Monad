package queue

import (
	"log"
	"sync"

	amqp "github.com/rabbitmq/amqp091-go"
)

func Receive(handle func([]byte) error) error {
	return ReceiveConcurrent(1, handle)
}

func ReceiveConcurrent(concurrency int, handle func([]byte) error) error {
	if concurrency < 1 {
		concurrency = 1
	}

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

	if err := ch.Qos(concurrency, 0, false); err != nil {
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

	jobs := make(chan amqp.Delivery, concurrency)
	var wg sync.WaitGroup
	var ackMu sync.Mutex

	for workerID := 1; workerID <= concurrency; workerID++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for d := range jobs {
				if err := handle(d.Body); err != nil {
					log.Printf("worker %d failed task delivery: %v", workerID, err)

					ackMu.Lock()
					if nackErr := d.Nack(false, true); nackErr != nil {
						log.Printf("worker %d failed to nack delivery: %v", workerID, nackErr)
					}
					ackMu.Unlock()
					continue
				}

				ackMu.Lock()
				if ackErr := d.Ack(false); ackErr != nil {
					log.Printf("worker %d failed to ack delivery: %v", workerID, ackErr)
				}
				ackMu.Unlock()
			}
		}(workerID)
	}

	for d := range msgs {
		jobs <- d
	}

	close(jobs)
	wg.Wait()

	return nil
}
