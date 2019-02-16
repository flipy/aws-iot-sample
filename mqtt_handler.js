import mqtt from 'mqtt';

class MqttHandler {
	constructor() {
		this.client = null;
		this.host = "mqtt://127.0.0.1";
		this.options = { clientID: "API" };
		this.username = "username";
		this.password = "password";
	}

	connect() {
		this.client = mqtt.connect(this.host, this.options);
		
		this.client.on('offline', () => {
			this.client.end(true, () => {
				connect();
			});
		});

		this.client.on('message', function(topic, message, packet) {
			console.log("message is: " + message);
			console.log("topic is: " + topic);
		})
	}

	publish(topic, message, options) {
		if (this.client.connected == true) {
			this.client.publish(topic, JSON.stringify(message), options);
			return true;
		} else {
			console.log("client not connected");
			return false;
		}
	}

	subscribe(topic, options) {
		if (this.client.connected == true) {
			this.client.subscribe(topic, options);
			return true;
		} else {
			console.log("client not connected");
			return false;
		}
	}
}

module.exports = MqttHandler;
