/*
 * This is the code for an Alexa skill Lambda function to get the current condtions from
 * a Weather Underground Personal Weather Station using the WU PWS API
 * Written by Jeff Thompson 2/12/17  
 *
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.


var https = require('https')
var testVariable = 55111

exports.handler = (event, context) => {


  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
      //console.log("wundergrounApiKey="+process.env.wundergrounApiKey)
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Jeff's weather station", false),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

/*
			var endpoint = "https://api.wunderground.com/api/e7320a5cc75e4a51/conditions/q/pws:KMICOMST2.json"
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
				var temp_f = data.current_observation.temp_f
				var wind_mph = data.current_observation.wind_mph
				var wind_dir = data.current_observation.wind_dir
				console.log("WIND DIR= "+wind_dir)
                context.succeed(
                  //generateResponse(
                    //buildSpeechletResponse(`Current temperature is ${temp_f} degrees, wind speed is ${wind_mph} miles per hour`, true),
                    //{}
                  //)
                )
              })
            })
        
*/




        switch(event.request.intent.name) {
          case "conditions":
            var endpoint = "https://api.wunderground.com/api/"+process.env.wundergroundApiKey+"/conditions/q/pws:KMICOMST2.json"
            //var endpoint = "https://api.wunderground.com/api/"+process.env.wundergroundApiKey+"/conditions/q/pws:KMIGRAND34.json"
            var body = ""
            //console.log("testvariable= "+$testVariable); 
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
				var temp_f = data.current_observation.temp_f
				var wind_mph = data.current_observation.wind_mph
				var wind_dir = data.current_observation.wind_dir
				var wind_dir_speech = windDirConvert (wind_dir);
				var wind_gust_mph = data.current_observation.wind_gust_mph ;
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current temperature is ${temp_f} degrees, wind speed is ${wind_mph} miles per hour from the ${wind_dir_speech}, gusting to ${wind_gust_mph}.`, true),
                    //buildSpeechletResponse(`Current temperature is ${temp_f} degrees, wind speed is ${wind_mph} miles per hour from the ${wind_dir}.`, true),
                    {}
                  )
                //console.log("testvariable= "+$testVariable);  
                )
              })
              //console.log("testvariable= "+$testVariable); 
            })
            break;

          case "temperature":
            var endpoint = "https://api.wunderground.com/api/"+process.env.wundergroundApiKey+"/conditions/q/pws:KMICOMST2.json"
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var temp_f = data.current_observation.temp_f
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current temperature is ${temp_f} degrees`, true),
                    {}
                  )
                )
              })
            })
            break;

          case "windSpeed":
            var endpoint = "https://api.wunderground.com/api/"+process.env.wundergroundApiKey+"/conditions/q/pws:KMICOMST2.json"
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
				var wind_mph = data.current_observation.wind_mph
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current windspeed is ${wind_mph} miles per hour`, true),
                    {}
                  )
                )
              })
            })
            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}


//Convert wind direction abbreviation to words
function windDirConvert (wind_dir) {
	var windDirConverted = "" 
	//console.log("IN FUNCTION wind_dir= "+wind_dir);
	switch (wind_dir) {
		case "East":
			windDirConverted = "east";
			break;
		case "ENE":
			windDirConverted = "east northeast";
			break;
		case "ESE":
			windDirConverted = "east southeast";
			break;
		case "NE":
			windDirConverted = "northeast";
			break;
		case "NNE":
			windDirConverted = "north northeast";
			break;
		case "NNW":
			windDirConverted = "north northwest";
			break;
		case "North":
			windDirConverted = "north";
			break;
		case "NW":
			windDirConverted = "northwest";
			break;
		case "SE":
			windDirConverted = "southeast";
			break;
		case "South":
			windDirConverted = "south";
			break;
		case "SSE":
			windDirConverted = "south southeast";
			break;
		case "SSW":
			windDirConverted = "south southwest";
			break;
		case "SW":
			windDirConverted = "southwest";
			break;
		case "Variable":
			windDirConverted = "variable";
			break;
		case "West":
			windDirConverted = "west";
			break;
		case "WNW":
			windDirConverted = "west northwest";
			break;
		case "WSW":
			windDirConverted = "west southwest";
		}
	return windDirConverted;
	}



// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}
