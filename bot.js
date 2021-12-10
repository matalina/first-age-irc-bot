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


const commands = {
    kick: {
        pattern: /kick ([\w\-\d]+) */,
        command: kickUser,
    },
};

const responses = {
    name: {
        pattern: new RegExp(process.env.BOT_NAME, 'i'),
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
        /^_?ian/i,
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
function randomWelcome(who) {
    let messages = [
        who + ', welcome back!',
        who + ', what\'s new?',
        'Howdy, ' + who + '!',
        'Oh, no! Not ' + who + ' again.',
        'Hey there, ' + who + "!",
        'What\'s happenin\', ' + who + "?",
        'Hi, '+ who +'!',
        'Here\'s ' + who + "!",
        'Greetings and salutations, '+ who + '!',
        'Oh, no! Not ' + who + ' again.',
        'Oh, yoohoo, '+ who + '!',
        'Aloha, ' + who + "!",
        'Hola, ' + who + '!',
        'Que Pasa, ' + who + "?",
        'Konnichiwa, ' + who + '!',
        'Namaste, ' + who + '!',
        'Oh, no! Not ' + who + ' again.',
    ];

    return messages[Math.floor(Math.random() * messages.length)];

}

function respondToBotsName(from, message) {
    if(/hi/i.test(message) ||
        /hey/i.test(message) ||
        /hello/i.test(message)) {
            bot.say(process.env.IRC_CHANNEL, 'How are you, ' + from + '?');
        }
    else {
        bot.say(process.env.IRC_CHANNEL, getRandomSaying());
    }

}

function getRandomSaying() {
    let sayings = [
        'Huzzah!',
        'Wha\'choo talin\' \'bout, Willis!',
        'Discretion is the greater part of valor.',
        'Everything you can imagine is real.',
        'I could agree with you but then we’d both be wrong.',
        "Fish and visitors stink after three days.",
        "Black Holes are where God divided by zero.",
        "I'd like to help you out. Which way did you come in?",
        "On the other hand, you have different fingers.",
        "Always remember to pillage BEFORE you burn.",
        "Procrastination is the greatest labor saving invention of all time.",
        'I don\'t suffer from insanity. I enjoy every minute of it.',
    ],
        random = Math.floor(Math.random() * sayings.length);

    return sayings[random];
}
