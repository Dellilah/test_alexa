var request = require("request")
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

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
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "LastInsuranceFee") {
      handleLastInsuranceFeeResponse(intent, session, callback);
    } else if (intentName == "AMAZON.YesIntent") {
      handleYesResponse(intent, session, callback);
    } else if (intentName == "AMAZON.NoIntent") {
      handleNoResponse(intent, session, callback);
    } else if (intentName == "AMAZON.HelpIntent") {
      handleGetHelpRequest(intent, session, callback);
    } else if (intentName == "AMAZON.StopIntent") {
      handleFinishSessionRequest(intent, session, callback);
    } else if (intentName == "AMAZON.CancelIntent") {
      handleFinishSessionRequest(intent, session, callback);
    } else {
      throw "Invalid Intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome to my test heckathon app about Reindeers!" +
    "I can only give facts about one at a time";

    var reprompt = "Which reindeer are you interested in?";

    var header = "Hackathon test reindeers!";

    var shouldEndSession = false;

    var sessionAttributes = {
      "speechOutput": speechOutput,
      "repromptText": reprompt
    };

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}

function handleLastInsuranceFeeResponse(intent, session, callback) {
    var month = intent.slots.Month.value;
    var paymentDate = getPaymentDateForMonthAndYear(month, "2017");

    var speechOutput = "we have an error";

    getJSON(function(data){
      if (data != "ERROR") {
        speechOutput = data;
      }
      callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", true));
    });
}

function url2() {
  return {
    url: "https://api.infakt.pl/v3/insurance_fees.json",
    qs: {
      "api_key": "xxx"
    }
  }
}

function url() {
  return "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=Albert+Einstein"
}

function getJSON(callback){
  // HTTP WITH WIKIPEDIA
  // request.get(url(), function(error, response, body) {
  //   var d = JSON.parse(body);
  //   var result = d.query.searchinfo.totalhits
  //   if (result > 0) {
  //     callback(result);
  //   } else {
  //     callback("ERROR");
  //   }
  // });

  // HTTPS WITH INFAKT
  request.get(url2(), function(error, response, body) {
    var d = JSON.parse(body);
    var result = d.entities;
      if (result.length > 0) {
        var lastSumPrice = parseInt(result[0].sum_amount_price)/100;
        var speechOutput = "You're last total insurance fee is "+lastSumPrice;
        callback(speechOutput);
      } else {
        callback("ERROR");
      }
  });
}

function handleYesResponse(intent, session, callback) {
  var speechOutput = "Which insurance period are you interested in?";
  var repromptText = speechOutput;
  var shouldEndSession = false;
  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleNoResponse(intent, session, callback) {
  handleFinishSessionRequest(intent, session, callback);
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    var speechOutput = "Which insurance period are you interested in?";
    var repromptText = speechOutput;
    var shouldEndSession = false;
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));

}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye! THANKS", "", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
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

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
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

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function getPaymentDateForMonthAndYear(monthStr, year){
    return new Date(monthStr+'-10-'+year)
}
