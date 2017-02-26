'use strict';
var Alexa = require('alexa-sdk');
var request = require("request");
var rq = require("request-promise");

var languageStrings = {
    "en-GB": {
        "translation": {
            "WELCOME_MESSAGE" : "Welcome to skill: ",
            "SKILL_NAME" : "Last Insurance Fee amount",
            "GET_FACT_MESSAGE" : "Here's your fact: ",
            "HELP_MESSAGE" : "Which insurance period are you interested in?",
            "HELP_REPROMPT" : "Which insurance period are you interested in?",
            "STOP_MESSAGE" : "Goodbye!"
        }
    },
    "en-US": {
        "translation": {
            "WELCOME_MESSAGE" : "Welcome to skill: ",
            "SKILL_NAME" : "Last Insurance Fee amount",
            "GET_FACT_MESSAGE" : "Here's your fact: ",
            "HELP_MESSAGE" : "Which insurance period are you interested in?",
            "HELP_REPROMPT" : "Which insurance period are you interested in?",
            "STOP_MESSAGE" : "Goodbye!"
        }
    }
};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
      var speechOutput = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
      this.emit(':tell', speechOutput);
    },
    'InsuranceFeeSum': function () {
      var that = this;
      getJSON(this).then(function (response) {
        var speechOutput = parseInt(response.entities[0].sum_amount_price)/100;
        that.emit(':tell', "You're last insurance fee sum is "+speechOutput);
      });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

function getJSON(that) {

    var options = {
        uri: "https://api.infakt.pl/v3/insurance_fees.json",
        qs: {
            api_key: "xxx"
        },
        json: true
    };

    return rq(options);
}
