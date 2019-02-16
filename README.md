# aws-iot-sample

1. Install Mosquitto

`sudo apt install mosquitto mosquitto-clients -y`

2. Copy bridge configuration

`sudo cp bridge.conf /etc/mosquitto/conf.d/`

3. Enable and start Mosquitto

`sudo systemctl enable mosquitto.service`
`sudo systemctl start mosquitto.service`

4. Install NodeJS

`curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -`
`sudo apt install nodejs -y`

5. Install GIT

`sudo apt install git -y`

6. Clone this repository

`git clone $URL`

7. Install NPM dependencies

`cd $REPO`
`npm install`

8. Run App

`npm run start`

By default it will listen on port 5000 and output information on the console
