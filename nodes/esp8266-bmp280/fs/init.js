/*
 * Copyright (c) 2014-2017 Cesanta Software Limited
 * All rights reserved
 *
 * This example demonstrates how to use mJS Arduino Adafruit_BME280
 * library API to get data from BME280 combined humidity and pressure sensor.
 *
 * DON'T FORGET TO SET YOUR I2C or SPI PINS IN THE MONGOOSE CONFIG!
 * Example:  `mos config-set i2c.scl_gpio=22 i2c.sda_gpio=23`
 *
 * Please examine the README for helpful details on using this example.
 */

// Load Mongoose OS API
load('api_timer.js');
load('api_arduino_bme280.js');
load('api_config.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_aws.js');
load('api_gpio.js');
load('api_rpc.js');

// Sensors address (Usually: 0x76 or 0x77)
//let sens_addr = Cfg.get('i2c.address') | 0x77;
let sens_addr = 0x76;

// Initialize Adafruit_BME280 library using the I2C interface
let bme = Adafruit_BME280.createI2C(sens_addr);

let pin = 2;
let deviceId = Cfg.get('device.id');

GPIO.set_mode(pin, GPIO.MODE_OUTPUT);

//
//let topic = 'metrics/' + Cfg.get('device.id');
//
//Timer.set(1000 /* milliseconds */, Timer.REPEAT, function() {
//  let msg = JSON.stringify({free: Sys.free_ram(), total: Sys.total_ram()});
//  print(topic, '->', msg);
//  MQTT.pub(topic, msg, 1);
//}, null);

if (bme === undefined) {
  print('No sensor found!');
} else {
  // This function reads data from the BME280 sensor every 30 seconds
  Timer.set(30000 /* milliseconds */, true /* repeat */, function() {
    print('Device:', deviceId);
    print('Timestamp:', Timer.now());
    print('Temperature:', bme.readTemperature(), '*C');
    print('Humidity:', bme.readHumidity(), '%RH');
    print('Pressure:', bme.readPressure(), 'hPa');
  }, null);
}

function applyAction() {
  GPIO.write(pin, state.on || 1);
}

// Milliseconds. How often to send temperature readings to the cloud
let freq = 60000;

let state = {
  on: false,
  temperature: bme.readTemperature(),
  humidity: bme.readHumidity(),
  pressure: bme.readPressure(),
  timestamp: Timer.now(),
  device: deviceId
};

let getStatus = function() {
  return {
    temperature: bme.readTemperature(),
    humidity: bme.readHumidity(),
    pressure: bme.readPressure(),
    on: GPIO.read(pin) === 1,
    timestamp: Timer.now(),
    device: deviceId
  };
};

RPC.addHandler('Sensor.SetState', function(args) {
  GPIO.write(pin, args.on || 0);
  AWS.Shadow.update(0, {
    desired: {
      on: state.on,
    },
  });
  return true;
});

RPC.addHandler('Sensor.GetState', function(args) {
  return getStatus();
});

// Send sensor's readings to the cloud
Timer.set(freq, Timer.REPEAT, function() {
  state = getStatus();
  reportState();
}, null);

function reportState() {
  if(state.timestamp <= 1000) {
    print('Initial reading, not reporting');
  } else {
    print('Reporting state:', JSON.stringify(state));
    AWS.Shadow.update(0, state);
  }
}

AWS.Shadow.setStateHandler(function(ud, ev, reported, desired) {
  print('Event:', ev, '('+AWS.Shadow.eventName(ev)+')');

  if (ev === AWS.Shadow.CONNECTED) {
    reportState();
    return;
  }

  print('Reported state:', JSON.stringify(reported));
  print('Desired state:', JSON.stringify(desired));

  // mOS will request state on reconnect and deltas will arrive on changes.
  if (ev !== AWS.Shadow.GET_ACCEPTED && ev !== AWS.Shadow.UPDATE_DELTA) {
    return;
  }

  // Here we extract values from previosuly reported state (if any)
  // and then override it with desired state (if present).
  updateState(reported);
  updateState(desired);

  print('New state:', JSON.stringify(state));

  applyAction();

  if (ev === AWS.Shadow.UPDATE_DELTA) {
    // Report current state
    reportState();
  }
}, null);

applyAction();
