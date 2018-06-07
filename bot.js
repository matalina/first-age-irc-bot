// Get the lib
const irc = require("irc");

// Create the bot name
let bot = new irc.Client('irc.mibbit.com', 'FAbot-dev', {
	channels: ['#testfa']
});

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
            bot.send('MODE','#thefirstage','+o', who);
        }
    }
});

// Listen for any message, PM said user when he posts
bot.addListener("pm", function(from, to, message) {
    //console.log(from);
    //console.log(to);
    //console.log(text);
    //console.log(message);
	let kick = lookForKickUser(message.args[1], from);
    let log = lookForLogChat(message.args[1],from);

    if(! kick || ! log) {
        bot.say(to,'Unable to do as you asked.');
    }

});


bot.addListener('error', function(message) {
    console.log('error: ', message);
});

//bot.send('MODE', '#yourchannel', '+o', 'yournick');

function notEmpty(value)
{
    return value !== null &&
        value !== undefined &&
        value !== '';
}

function lookForKickUser(message, from) {
    let pattern = /kick ([\w\-\d]+) */,
        matches = pattern.exec(message),
        name;

    if(notEmpty(matches)) {
        name = matches[1];
    }
    else {
         return false;
    }

    bot.send('KICK','#thefirstage',name);
    bot.say(from, 'Kicked ' + name + ' from #thefirstage');

    return true;
}

function lookForLogChat(message, from) {
    let pattern = /log (start|stop)?/,
        matches = pattern.exec(message),
        command;

    if(notEmpty(matches)) {
        if(notEmpty(matches[1])) {
            command = matches[1];
        }
        else {
            command = 'start';
        }
    }
    else {
         return false;
    }

    if(command === 'start') {
        bot.addListener('message#thefirstage', logChat);
        bot.say(from, 'started');

    }
    else if(command === 'stop') {
        bot.removeListener('message#thefirstage', logChat)
        bot.say(from, 'stopped');
    }


    return false;
}

const logChat = function(from, message) {
    console.log(from + ' => #thefirstage: ' + message);

}

function randomWelcome(who) {
    let messages = [
        who + ', welcome back!',
        who + ', what\'s new?',
        'Howdy, ' + who + '!',
        'Hey there, ' + who + "!",
        'What\'s happenin\', ' + who + "?",
        'Hi, '+ who +'!',
        'Here\'s ' + who + "!",
        'Greetings and salutations, '+ who + '!',
        'Oh, yoohoo, '+ who + '!',
        'Aloha, ' + who + "!",
        'Hola, ' + who + '!',
        'Que Pasa, ' + who + "?",
        'Konnichiwa,' + who + '!',
        'Namaste, ' + who + '!',
    ];

    return messages[Math.floor(Math.random() * messages.length)];

}
