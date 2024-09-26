import { Channel, Connection, connect } from "amqplib";
import Consumer from "./consumer";
import Producer from "./producer";
import config from "../config";
import { EventEmitter } from "events";

// Singleton Instance
class RabbitMQClient {
  private constructor() {}

  private static instance: RabbitMQClient;
  private isInitialzed: boolean = false;
  private producer: Producer;
  private consumer: Consumer;
  private connection: Connection;
  private producerChannel: Channel;
  private consumerChannel: Channel;
  private eventEmitter: EventEmitter;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient();
    }

    return this.instance;
  }
  async initialize() {
    if (this.isInitialzed) {
      return;
    }
    try {
      this.connection = await connect(config.rabbitMQ.url);
      this.eventEmitter = new EventEmitter();
      this.producerChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      // setting exclusive to true means that when this channel is deleted
      // the queue also will be deleted
      const { queue: replyQueueName } = await this.consumerChannel.assertQueue(
        "",
        { exclusive: true }
      );

      this.consumer = new Consumer(
        this.consumerChannel,
        replyQueueName,
        this.eventEmitter
      );
      this.producer = new Producer(
        this.producerChannel,
        replyQueueName,
        this.eventEmitter
      );

      this.consumer.consumeMessages();
      this.isInitialzed = true;
    } catch (error) {
      console.log("rabbitMQ error: ", error);
    }
  }

  async produce(data: any) {
    if (!this.isInitialzed) {
      await this.initialize();
    }
    return await this.producer.produceMessage(data);
  }
}

export default RabbitMQClient.getInstance();
