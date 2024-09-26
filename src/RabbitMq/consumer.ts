import { Channel, ConsumeMessage } from "amqplib";
import { EventEmitter } from "events";
import config from "../config";
export default class Consumer {
  constructor(
    private channel: Channel,
    private replyqueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async consumeMessages() {
    console.log("Ready to consume messages..");
    this.channel.consume(
      this.replyqueueName,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          console.log("Received message: ", msg.content.toString());
          this.eventEmitter.emit(msg.properties.correlationId.toString(), msg);
        } else {
          console.log("Received empty message");
        }
      },
      {
        // when noAck is true once the message has been consumed succesfully
        // it will be removed from the replyqueue
        noAck: true,
      }
    );
  }
}
