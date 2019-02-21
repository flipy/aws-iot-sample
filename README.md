# aws-iot-sample

Simple serverless solution to build a home monitor dashboard using AWS IoT.

Hardware used in this solution:
- ESP8266 with BMP280 sensor to act as a sensor node
- Raspbery Pi 3 to act as GreenGrass Core

Software and services used in this solution:
- AWS IoT to stream metrics from sensor nodes
- AWS DynamoDB to store metric's data
- AWS Cognito to use a identity provider -- although only unauthenticated access is being controlled
- AWS S3 to store and host dashboard's website
- Mongoose-os as the firmware on the sensor


Optional steps, if GreenGrass is used:
1. Install NodeJS and Python
2. Create a GreenGrass group and a GreenGrass core -- to link to AWS documentation
3. Download and install GreenGrass on the target core

Steps:
1. Clone this repository
2. Install mos -- or build it for your system
3. Build firmware for your specific platform: mos build --platform=esp8266
4. Flash the microcontroller: mos flash
5. Set up WiFi on your device: mos wifi "SSID" "Password"
6. Set up AWS IoT: mos aws-iot-setup --aws-region REGION. If using greengrass: mos aws-iot-setup -aws-region REGION --aws-enable-greengrass
7. Enable MQTT server: mos config-set mqtt.enable=true
8. Create DynamoDB table to store data
9. Create AWS Cognito Identity Provider -- modify the unauthorized IAM role to be able to query DynamoDB
10. Create a S3 bucket and enable Website Hosting -- remeber to set it public
11. Create a AWS IoT rule to insert shadow data to DynamoDB split by columns -- use shadow/update/accepted topic
12. Upload the content of the web folder into S3, and modify Congito Identity Pool ID on refresh.js 

Debugging:
To debug the code on the microcontroller, use mos console.
To debug GreenGrass, look at the log files on the var/log/system folder of GreenGrass folder
