require('dotenv').config();
const fs = require('fs');
const moment = require('moment');

// Get the lib
const irc = require("irc");

// Create the bot name
let bot = new irc.Client(process.env.IRC_NETWORK, process.env.BOT_NAME, {
	channels: [process.env.IRC_CHANNEL]
});

// Global Variables

let logging_on = false,
    file = null;

function notEmpty(value) {
    return value !== null && value !== undefined && value !== '';
}

let kickUser = function(message, from) {
    let pattern = commands.kick.pattern,
        matches = pattern.exec(message),
        name;

    if(notEmpty(matches)) {
        name = matches[1];
    }
    else {
         return;
    }

    bot.say(from, 'Attempting to kick ' + name + ' ' + process.env.IRC_CHANNEL);
    bot.send('KICK', process.env.IRC_CHANNEL, name);
}

let logChat = function(message, from) {
    let pattern = commands.log.pattern,
        matches = pattern.exec(message),
        command;

        if(notEmpty(matches)) {
            if(matches.length === 1) {
                command = 'start';
            }
            else {
                command = matches[1];
            }
        }
        else {
            bot.say(from, 'I can\'t do that on ' + process.env.IRC_CHANNEL);
            return;
        }

        if(command === 'stop' && ! logging_on) {
            bot.say(from, 'Logging has not been started on ' + process.env.IRC_CHANNEL);
            return;
        }

        if(command === 'start' && logging_on) {
            bot.say(from, 'Logging has already been turned on for ' + process.env.IRC_CHANNEL);
            return;
        }

        if(command === 'start') {
            logging_on = true;
            file = moment.format(YYYYMMDD) + '.txt';
            bot.say(from, 'Starting logging on ' + process.env.IRC_CHANNEL);
        }
        else if(command === 'stop') {
            logging_on = false;
            bot.say(from, 'Stopping logging on ' + process.env.IRC_CHANNEL);
        }
        else {
            bot.say(from, 'I don\'t know what you are trying to do on ' + process.env.IRC_CHANNEL);
            return;
        }
}

const commands = {
    kick: {
        pattern: /kick ([\w\-\d]+) */,
        command: kickUser,
    },
    /*log: {
        pattern: /log (start|stop)?/,
        command: logChat,
    }*/
};

const responses = {
    name: {
        pattern: new RegExp(process.env.BOT_NAME),
        command: respondToBotsName
    }
}

// Listen for joins
bot.addListener("join", function(channel, who) {
	// Welcome them in!
	bot.say(channel, randomWelcome(who));

    let admins = [
        /^_?asc/i,
        /^_?ck/i,
    ];

    for (let i in admins) {
        if(admins[i].test(who)) {
            bot.send('MODE',process.env.IRC_CHANNEL,'+o', who);
        }
    }
});

// Listen for any commands sent via pm
bot.addListener("pm", function(from, to, message) {
    let command = message.args[1];

    for(type in commands) {
        if(commands[type].pattern.test(command)) {
            commands[type].command(command, from);
        }
    }
});

// Listen for errors
bot.addListener('error', function(message) {
    console.log(message);

    let text = message.args[0] + ' on ' + message.args[1] + ': ' + message.args[2];

    let data = {
      from: 'alicia@akddev.net',
      to: 'alicia@akddev.net',
      subject: '[Error] FA Bot command failed',
      text: text,
    };

    sendEmail(data);

});

// Listen to messages in channel
bot.addListener('message' + process.env.IRC_CHANNEL, function (from, message) {
    console.log(from + ' on '+ process.env.IRC_CHANNEL + ': ' + message);
    if(logging_on) {
        logChatToFile(from, message);
    }

    for(type in responses) {
        if(responses[type].pattern.test(message)) {
            responses[type].command(from, message);
        }
    }
});

/* Functions */
function sendEmail(data) {
    const api_key = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    const mailgun = require('mailgun-js')({
        apiKey: api_key,
        domain: domain
    });

    mailgun.messages().send(data, function (error, body) {

    });
}

function randomWelcome(who) {
    let messages = [
        who + ', welcome back!',
        who + ', what\'s new?',
        'Howdy, ' + who + '!',
        'Oh, no! Not ' + who + 'again.',
        'Hey there, ' + who + "!",
        'What\'s happenin\', ' + who + "?",
        'Hi, '+ who +'!',
        'Here\'s ' + who + "!",
        'Greetings and salutations, '+ who + '!',
        'Oh, no! Not ' + who + 'again.',
        'Oh, yoohoo, '+ who + '!',
        'Aloha, ' + who + "!",
        'Hola, ' + who + '!',
        'Que Pasa, ' + who + "?",
        'Konnichiwa,' + who + '!',
        'Namaste, ' + who + '!',
        'Oh, no! Not ' + who + ' again.',
    ];

    return messages[Math.floor(Math.random() * messages.length)];

}

function logChatToFile(from, message) {
    let path = 'chats/' + file,
        message = '';

    fs.appendFile(path, message, function(error) {
        if(error) {
            console.log(error);

            let text = JSON.stringify(error);

            let data = {
              from: 'alicia@akddev.net',
              to: 'alicia@akddev.net',
              subject: '[Error] Write File failed',
              text: text,
            };

            sendEmail(data);
        }
    });
}

function respondToBotsName(from, message) {
    if(/hi/.test(message) ||
        /hey/.test(message) ||
        /hello/.test(message)) {
            bot.say(process.env.IRC_CHANNEL, 'How are you, ' + from + '?');
        }
}
