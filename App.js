import React, { Component } from 'react';
import {PermissionsAndroid, Text, ScrollView, Button} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default class App extends Component{

  constructor(){
      super();
      this.manager = new BleManager();
      this.devices = [];

      this.state = {
        permissionStatus:'denied', 
        bluetoothStatus: 'disabled',
        info:''
    }
  }

  info(message) {
      this.setState({info: message})
  }

  error(message) {
      this.setState({info: "ERROR: " + message})
  }

  async requestPermission() {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.setState({permissionStatus:'granted'});
        }else if(granted === PermissionsAndroid.RESULTS.DENIED) {
          this.setState({permissionStatus:'denied'});
        }
      } catch (err) {
        console.error(err)
      }
    }

  scanAndConnect() {
    this.devices = [];

    this.manager.startDeviceScan(null, {allowDuplicates:false}, (error, device) => {
      this.info("Scanning...")
      this.devices.push(device.name)
      if(error){
        this.error(error.message)
        return
      }
    })    
  }

  startScan() {
    this.info("Scanning....")
    this.scanAndConnect()
    this.timer()
  }

  stopScan() {
    this.info("Scanner Stopped")
    this.manager.stopDeviceScan();
  }

  timer() {
    setTimeout(() => {
      this.stopScan();
    }, 7000)
  }

  componentDidMount() {
    this.requestPermission();
    const subscription = this.manager.onStateChange((state) => {
      if(state === 'PoweredOn'){
        this.setState({bluetoothStatus:'enabled'});
        this.scanAndConnect();
        subscription.remove();
      } else {
        this.setState({bluetoothStatus:'disabled'});
      }
    }, true);

    this.timer();
  }

  render(){
      return(
            <ScrollView style={{flex:1, padding:15}}>
              <Text style={{fontSize:20, alignSelf:'center', color:'steelblue'}}>
                  Location access is {this.state.permissionStatus}
              </Text>
              <Text style={{fontSize:20, alignSelf:'center', color:'blue'}}>
                  Bluetooth is {this.state.bluetoothStatus}
              </Text>
              <Text style={{fontSize:20, alignSelf:'center', color:'black'}}>
                  {this.state.info}
              </Text>
              <Button style={{padding:5}} title="Start Scanning" onPress={this.startScan}><Text>Start Scanning</Text></Button>
              <Button style={{padding:5}} title="Stop Scanning" onPress={this.stopScan}><Text>Stop Scanning</Text></Button>
              <Text style={{fontSize:20, alignSelf:'center', color:'black'}}>
                  {this.devices}
              </Text>
            </ScrollView>
      );
  }
}