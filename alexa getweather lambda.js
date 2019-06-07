/*
 * This is the code for an Alexa skill Lambda function to get the current condtions from
 * a Weather Underground Personal Weather Station using the WU PWS API
 * Written by Jeff Thompson 2/12/17
 *
 * Updated by Jeff Thompson 5/30/18 to use new Wunderground PWS API
 *
 *
 *
 *
 *
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.


var https = require('https');

//var testVariable = 55111;

exports.handler = (event, context) => {


  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION");
      //console.log("wundergrounApiKey="+process.env.wundergrounApiKey)
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`);
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Jeff's weather station", false), {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST HAS BEEN ENTERED`);

        var endpoint = "https://api.weather.com/v2/pws/observations/current?stationId=KMICOMST2&format=json&units=e&apiKey=dd7c789c34994a44bc789c34994a4417";
        var body = "";

        //  resp.on('data', function(data) {
        //  respContent += data.toString(); //data is a buffer instance



        https.get(endpoint, (response) => {
          response.on('data', (chunk) => { body += chunk });
          response.on('end', () => {
            console.log("BODY= " + body);
            var responsedata = JSON.parse(body);
            //console.log("PARSED BODY= ",responsedata);
            var observation = responsedata.observations[0];
            //console.log("observations[0]=  ",responsedata.observations[0]);

            var stationID = observation.stationID;
            console.log("STATION ID= ", stationID);
            //console.log("EPOCH= ", observation.epoch);
            //console.log("temp= ", observation.imperial.temp);
            //console.log("precipTotal= ", observation.imperial.precipTotal);

            var wind_mph = observation.imperial.windSpeed;
            var wind_dir = observation.winddir;
            var temp_f = observation.imperial.temp;
            var precipTotal = observation.imperial.precipTotal;
            var heatIndex = observation.imperial.heatIndex;
            var dewpt = observation.imperial.dewpt;
            var windChill = observation.imperial.windChill;
            console.log("TEMP F= " + temp_f);
            console.log("WIND SPEED= " + wind_mph);
            console.log("WIND DIR= " + wind_dir);
            console.log("WIND CHILL= " + windChill);
            console.log("HEAT INDEX= " + heatIndex);
            console.log("PRECIP TOTAL= ", precipTotal);
            console.log("DEW POINT= " + dewpt);

            var wind_dir_speech = degToCompass(wind_dir);
            console.log("WIND DIR SPEECH= " + wind_dir_speech);


            if (wind_mph == 0) {
              var wind_speed_response = `winds are calm`;
            }
            else if (wind_mph == 1) {
              wind_speed_response = `wind speed is ${wind_mph} mile per hour from the ${wind_dir_speech}`;
            }
            else {
              wind_speed_response = `wind speed is ${wind_mph} miles per hour from the ${wind_dir_speech}`;
            }

            context.succeed(
              generateResponse(
                buildSpeechletResponse(`Current temperature is ${temp_f} degrees, dew point is ${dewpt}, ${wind_speed_response} `, true), {})
              // buildSpeechletResponse('Current temperature is ${ temp_f } degrees, wind speed is ${ wind_mph } miles per hour `, true), {})
            );
          });
        });

        /*

                                                switch (event.request.intent.name) {
                                                  case "conditions":
                                                    var endpoint = "https://api.weather.com/v2/pws/observations/current?stationId=KMICOMST2&format=json&units=e&apiKey=" + process.env.wundergroundApiKey
                                                    //https: //api.weather.com/v2/pws/observations/current?stationId=KMICOMST2&format=json&units=e&apiKey=dd7c789c34994a44bc789c34994a4417
                                                    //var endpoint = "https://api.wunderground.com/api/" + process.env.wundergroundApiKey + "/conditions/q/pws:KMICOMST2.json"
                                                    //var endpoint = "https://api.wunderground.com/api/"+process.env.wundergroundApiKey+"/conditions/q/pws:KMIGRAND34.json"
                                                    var body = ""
                                                    console.log(`
                              NOW EXECUTING GET REQUEST `)
                                                    https.get(endpoint, (response) => {
                                                      response.on('data', (chunk) => { body += chunk });
                                                      response.on('end', () => {
                                                        var data = JSON.parse(body);
                                                        console.log("testvariable= " + $data)
                                                        var temp = data.current_observation.temp_f;
                                                        // var wind_mph = data.current_observation.wind_mph;
                                                        // var wind_dir = data.current_observation.wind_dir;
                                                        // var wind_dir_speech = windDirConvert(wind_dir);
                                                        // var wind_gust_mph = data.current_observation.wind_gust_mph;
                                                        // var dewpoint_f = data.current_observation.dewpoint_f;
                                                        context.succeed(
                                                          generateResponse(
                                                            buildSpeechletResponse(`
                              Current temperature is $ { temp } degrees, , dew point is $ { dewpoint_f } degrees, wind speed is $ { wind_mph } miles per hour from the $ { wind_dir_speech }, gusting to $ { wind_gust_mph }.
                              `, true),
                                                            //buildSpeechletResponse(`
                              Current temperature is $ { temp_f } degrees, wind speed is $ { wind_mph } miles per hour from the $ { wind_dir }.
                              `, true),
                                                            {}
                                                          )
                                                          //console.log("testvariable= "+$testVariable);
                                                        );
                                                      });
                                                      //console.log("testvariable= "+$testVariable);
                                                    });
                                                    break;

                                                  case "temperature":
                                                    var endpoint = "https://api.wunderground.com/api/" + process.env.wundergroundApiKey + "/conditions/q/pws:KMICOMST2.json"
                                                    var body = ""
                                                    https.get(endpoint, (response) => {
                                                      response.on('data', (chunk) => { body += chunk })
                                                      response.on('end', () => {
                                                        var data = JSON.parse(body)
                                                        var temp_f = data.current_observation.temp_f
                                                        context.succeed(
                                                          generateResponse(
                                                            buildSpeechletResponse(`
                              Current temperature is $ { temp_f } degrees `, true), {}
                                                          )
                                                        )
                                                      })
                                                    })
                                                    break;

                                                  case "windSpeed":
                                                    var endpoint = "https://api.wunderground.com/api/" + process.env.wundergroundApiKey + "/conditions/q/pws:KMICOMST2.json"
                                                    var body = ""
                                                    https.get(endpoint, (response) => {
                                                      response.on('data', (chunk) => { body += chunk })
                                                      response.on('end', () => {
                                                        var data = JSON.parse(body)
                                                        var wind_mph = data.current_observation.wind_mph
                                                        context.succeed(
                                                          generateResponse(
                                                            buildSpeechletResponse(`
                              Current windspeed is $ { wind_mph } miles per hour `, true), {}
                                                          )
                                                        )
                                                      })
                                                    })
                                                    break;

                                                  default:
                                                    throw "Invalid intent"
                                              */
        //}

        break;




      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`
                              SESSION ENDED REQUEST `);
        break;

      default:
        context.fail(`
                              INVALID REQUEST TYPE: $ { event.request.type }
                              `)

    }

  }
  catch (error) { context.fail(`
                              Exception: $ { error }
                              `) }

}

//Function Converts degrees to compass cardinal directions
function degToCompass(num) {
  while (num < 0) num += 360;
  while (num >= 360) num -= 360;
  val = Math.round((num - 11.25) / 22.5);
  arr = ["north", "north northeast", "northeast", "east northeast", "east", "east southeast", "southeast", "south southeast",
    "south", "south southwest", "southwest", "west southeast", "west", "west northwest", "northwest", "north northwest"
    //arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE",
    // "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  return arr[Math.abs(val)];
}

//Convert wind direction abbreviation to words
function windDirConvert(wind_dir) {
  var windDirConverted = ""
  console.log("IN FUNCTION wind_dir= " + wind_dir);
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
