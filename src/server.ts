import express from "express";
import RabbitMQClient from "./RabbitMq/client";
const app = express();
app.use(express.json());
app.post("/operate", async (req, res) => {
  console.log(req.body);
  const response = await RabbitMQClient.produce(req.body);
  console.log("the response is:"+response);
  res.status(200).json({result: response});
});
app.listen(3001, async () => {
  console.log("app is listening");
  RabbitMQClient.initialize();
});
