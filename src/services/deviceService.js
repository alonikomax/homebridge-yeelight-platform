//
//  deviceService.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 31/10/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//
const YeePlatform = require('yeelight-platform')
const EventEmitter = require('events')

const YeeAgent = YeePlatform.Discovery
const YeeDevice = YeePlatform.Device


class YeeDeviceService extends EventEmitter {
  constructor() {
    super()
    this.agent = new YeeAgent()
    this.isDiscovering = false
    this.logger = null
    this.homebridge = null
    this.devices = {}
  }

  setHomebridge(homebridgeRef) {
    this.homebridge = homebridgeRef
  }

  setLogger(logger) {
    this.logger = logger
  }

  startDiscovery() {
    if (this.isDiscovering) return
    this.isDiscovering = true
    this.bindAgent()
    this.agent.listen()
  }

  bindAgent() {
    this.agent.on('started', () => {
      this.log('** Discovery Started **')
    })

    this.agent.on('didDiscoverDevice', (device) => {
      this.handleDeviceDiscovery(device)
    })
  }

  addCachedDevice(device) {
    var newDevice = {}
    newDevice.yeeDevice = new YeeDevice(device)

    this.devices[device.id] = newDevice
  }

  handleDeviceDiscovery(device) {
    // Check if device already exists
    if (this.devices[device.id] != null) {
      // Device already exists
      const oldDevice = this.devices[device.id]
      oldDevice.yeeDevice.updateDevice(device)
      this.devices[device.id] = oldDevice
      this.emit('deviceUpdated', device)
      return
    }
    // Add New Device
    var newDevice = {}
    newDevice.yeeDevice = new YeeDevice(device)
    this.devices[device.id] = newDevice
    this.emit('deviceAdded', device)
  }

  log(...args) {
    if (this.logger) {
      this.logger(args)
    }
  }
}
const service = new YeeDeviceService()
module.exports = service
