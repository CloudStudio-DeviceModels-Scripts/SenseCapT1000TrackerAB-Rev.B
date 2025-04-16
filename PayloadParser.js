function getTrackerData(payload)
{
    
    var decoded = {
        latitude: null,
        longitude: null,
        battery: null,
        sos: null,
        light:null,
        temperature:null,
        timeStamp:null
    };
   
    for (let tag in payload) {
    
        switch (tag){
            case "err":
                break;
            case "messages":
                var tagvalues = payload[tag];
                tagvalues.forEach(valueElement => {
                    valueElement.forEach(element => {
                       switch (element.type){
                        case "Longitude":
                            decoded.longitude = element.measurementValue;
                            break;
                        case "Latitude":
                            decoded.latitude = element.measurementValue;
                            break;
                        case "Battery":
                            decoded.battery = element.measurementValue;
                            break;
                        case "SOS Event":
                            decoded.sos = element.measurementValue;
                            break;
                        case "Air Temperature":
                            decoded.temperature = element.measurementValue;
                            break;
                        case "Light":
                            decoded.light = element.measurementValue;
                            break;
                        case "Timestamp":
                            decoded.timeStamp = new Date(element.measurementValue).toUTCString();
                            break;
                        }
                    });
                });    

            case "payload":
                break;
            case "valid":
                break;
            default:
                console.log("Error: Atributo desconocido : ", tag)            
        }
    }
    return decoded;
}


function parseUplink(device, payload)
{
	// This function allows you to parse the received payload, and store the 
	// data in the respective endpoints. Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device that produced the payload. 
	//   You can use "device.endpoints" to access the collection 
	//   of endpoints contained within the device. More information
	//   at https://wiki.cloud.studio/page/205
	// - payload: object containing the payload received from the device. More
	//   information at https://wiki.cloud.studio/page/208.

	

        var data = payload.asParsedObject();
        env.log("Received data", data);

        // Get device data from payload
        var trackerData = getTrackerData(data);

        // Geolocation
        if(trackerData.latitude != null && trackerData.longitude != null && trackerData.timeStamp !=null) {
            var eplt = device.endpoints.byType(endpointType.locationTracker);
            if (eplt != null)
            {
                eplt.updateLocationTrackerStatus(trackerData.latitude, trackerData.longitude, 0, locationTrackerFlags.none, trackerData.timeStamp);
                
            }
                
        }

        //SOS Alarm

        if (trackerData.sos != null){
            var epsos =device.endpoints.byType(endpointType.iasSensor, iasEndpointSubType.alarmInput);
            if (epsos != null){
                if (trackerData.sos == 1){
                    epsos.updateIASSensorStatus(iasSensorState.active);
                } else {
                    epsos.updateIASSensorStatus(iasSensorState.idle);
                }
            }
                
        }

        // Battery
        if(trackerData.battery != null)
        {
            var epbatt = device.endpoints.byAddress("2");
            if (epbatt != null)
                epbatt.updateGenericSensorStatus(trackerData.battery);

        }
    
        // Light
        if(trackerData.light != null)
        {
            var eplight = device.endpoints.byAddress("5");
            if (eplight != null)
                eplight.updateGenericSensorStatus(trackerData.light);

        }
        // Temperature
        if(trackerData.temperature != null)
        {
            var eptemp = device.endpoints.byType(endpointType.temperatureSensor);
            if (eptemp != null)
                eptemp.updateTemperatureSensorStatus(trackerData.temperature);

        }

}

function buildDownlink(device, endpoint, command, payload) 
{ 
	// This function allows you to convert a command from the platform 
	// into a payload to be sent to the device.
	// Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device to which the command will
	//   be sent. 
	// - endpoint: endpoint object representing the endpoint to which the 
	//   command will be sent. May be null if the command is to be sent to 
	//   the device, and not to an individual endpoint within the device.
	// - command: object containing the command that needs to be sent. More
	//   information at https://wiki.cloud.studio/page/1195.

	// This example is written assuming a device that contains a single endpoint, 
	// of type appliance, that can be turned on, off, and toggled. 
	// It is assumed that a single byte must be sent in the payload, 
	// which indicates the type of operation.

/*
	 payload.port = 25; 	 	 // This device receives commands on LoRaWAN port 25 
	 payload.buildResult = downlinkBuildResult.ok; 

	 switch (command.type) { 
	 	 case commandType.onOff: 
	 	 	 switch (command.onOff.type) { 
	 	 	 	 case onOffCommandType.turnOn: 
	 	 	 	 	 payload.setAsBytes([30]); 	 	 // Command ID 30 is "turn on" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.turnOff: 
	 	 	 	 	 payload.setAsBytes([31]); 	 	 // Command ID 31 is "turn off" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.toggle: 
	 	 	 	 	 payload.setAsBytes([32]); 	 	 // Command ID 32 is "toggle" 
	 	 	 	 	 break; 
	 	 	 	 default: 
	 	 	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 	 	 break; 
	 	 	 } 
	 	 	 break; 
	 	 default: 
	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 break; 
	 }
*/

}