import express from 'express';
import bodyParser from 'body-parser';
import MqttHandler from './mqtt_handler';

const PORT = 5000;

const app = express();
const client = new MqttHandler();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/subscribe', (req, res) => {
	if (req.body.topic) {
		if (client.subscribe(req.body.topic)) {
			res.status(200).send({
				success: 'true',
				message: 'topic subscribed'
			});
		}
	} else {
		return res.status(400).send({
			success: 'false',
			message: 'topic missing'
		});
	}
});

app.post('/api/message', (req, res) => {
	if (req.body.topic && req.body.message) {
		if (client.publish(req.body.topic, req.body.message, "{ qos: 1 }")) {
			res.status(200).send({
				success: 'true'
			});
		} else {
			res.status(400).send({
				success: 'false',
				message: 'message not send'
			});
		}
	}
});

client.connect();

var server = app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`)
});
