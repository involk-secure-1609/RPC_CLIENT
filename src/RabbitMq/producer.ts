import { Channel, ConsumeMessage } from "amqplib";
import config from "../config";
import { randomUUID } from "crypto";
import EventEmitter from "events";
export default class Producer {
  constructor(
    private channel: Channel,
    private replyqueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async produceMessage(data: any) {
    const uuid = randomUUID();
    console.log("the correlation id is :" + uuid);
    this.channel.sendToQueue(
      config.rabbitMQ.queues.rpcQueue,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyqueueName,
        correlationId: uuid,
        headers: {
          function: data.operation,
        },
      }
    );
    return new Promise((resolve, reject) => {
      this.eventEmitter.once(uuid, async (data) => {
        const reply = JSON.parse(data).toString();
        resolve(reply);
      });
    });
  }
}
