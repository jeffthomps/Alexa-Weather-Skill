/*
 * This is the code for an Alexa skill Lambda function to get the current condtions from
 * Weather Personal Weather Station using the WU PWS API
 * Written by Jeff Thompson 2/12/17  
 *
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        
        if (event.session.application.applicationId !== "amzn1.ask.skill.9a2278b9-9806-4ada-a5ea-e2d3322b5a00") {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);

}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("conditions" === intentName) {
        getPWSapiData(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    var sessionAttributes = {};
    var speechOutput = "Welcome to Jeff's Resistor Decoder, what are the four colors?";
    var shouldEndSession = false;
    var reprompt = "I'm ready for the four color bands when you are.";

    callback(sessionAttributes,
        buildSpeechletResponseReprompt(speechOutput, reprompt, shouldEndSession));
}

function getHelpResponse(callback) {
    var sessionAttributes = {};
    var speechOutput = "Resistor helper takes four color values and returns the calculated resistance and tolerance. The provided values should be something similar to black, brown, red, gold.";
    var shouldEndSession = false;
    var reprompt = "I'm ready for the four color bands when you are, with the tolerance band last.";

    callback(sessionAttributes,
        //buildSpeechletResponseReprompt(reprompt, speechOutput, shouldEndSession));
        buildSpeechletResponseReprompt(speechOutput, reprompt, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var speechOutput = "Thank you for using Jeff's resistor decoder, goodbye!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletPlainResponse(speechOutput, shouldEndSession));
}

function getPWSapiData(intent, session, callback) {
    var value = 0;
    var tolerance;
    var repromptText = null;
    var sessionAttributes = {};
    //var shouldEndSession = true;
    var shouldEndSession = false;
    var speechOutput = "";
    var badValue = "I'm sorry, I must've misheard. The ";
    var badValueCont = " band isn't valid. Could you repeat the colors?";


    /*
    switch(intent.slots.First.value) {
        case "black":
            value += 0;
            break;
        case "brown":
            value += 10;
            break;
        case "red":
            value += 20;
            break;
        case "orange":
            value += 30;
            break;
        case "yellow":
            value += 40;
            break;
        case "green":
            value += 50;
            break;
        case "blue":
            value += 60;
            break;
        case "violet":
            value += 70;
            break;
        case "purple":
            value += 70;
            break;
        case "grey":
            value += 80;
            break;
        case "white":
            value += 90;
            break;
        default:
            ErrorReprompt(badValue+"first"+badValueCont, callback);
            break;            
    }
    switch(intent.slots.Second.value) {
        case "black":
            value += 0;
            break;
        case "brown":
            value += 1;
            break;
        case "red":
            value += 2;
            break;
        case "orange":
            value += 3;
            break;
        case "yellow":
            value += 4;
            break;
        case "green":
            value += 5;
            break;
        case "blue":
            value += 6;
            break;
        case "violet":
            value += 7;
            break;
        case "purple":
            value += 7;
            break;
        case "grey":
            value += 8;
            break;
        case "white":
            value += 9;
            break;
        default:
            ErrorReprompt(badValue+"second"+badValueCont, callback);
            break;
    }
    switch(intent.slots.Third.value) {
        case "black":
            value *= 1;
            break;
        case "brown":
            value *= 10;
            break;
        case "red":
            value *= 100;
            break;
        case "orange":
            value *= 1000;
            break;
        case "yellow":
            value *= 10000;
            break;
        case "green":
            value *= 100000;
            break;
        case "blue":
            value *= 1000000;
            break;
        case "violet":
            value *= 10000000;
            break;
        case "purple":
            value *= 10000000;
            break;
        case "gold":
            value *= 0.1;
            break;
        case "silver":
            value *= 0.01;
            break;
        default:
            ErrorReprompt(badValue+"third"+badValueCont, callback);
            break;
    }
    switch(intent.slots.Fourth.value) {
        case "brown":
            tolerance = 1;
            break;
        case "red":
            tolerance = 2;
            break;
        case "green":
            tolerance = 0.5;
            break;
        case "blue":
            tolerance = 0.25;
            break;
        case "violet":
            tolerance = 0.1;
            break;
        case "purple":
            tolerance = 0.05;
            break;
        case "gold":
            tolerance = 5;
            break;
        case "silver":
            tolerance = 10;
            break;
        default:
            ErrorReprompt(badValue+"fourth"+badValueCont, callback);
            break;
    }
    */
    
    
    speechOutput =  "That is "
                    +value+" ohms, "
                    +tolerance+" percent. Next?";

    callback(sessionAttributes,
         buildSpeechletPlainResponse(speechOutput, shouldEndSession));
}

function ValueToBands(intent, session, callback) {
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    
    
    speechOutput =  "The color bands should be ";

    callback(sessionAttributes,
         buildSpeechletPlainResponse(speechOutput, shouldEndSession));
}

function ErrorReprompt(errorText, callback){
    callback(null, buildSpeechletPlainResponse(errorText, false));
}
// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseReprompt(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletPlainResponse(output, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
