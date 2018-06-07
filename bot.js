// Get the lib
const irc = require("irc");

// Create the bot name
let bot = new irc.Client('irc.mibbit.com', 'FAbot', {
	channels: ['#thefirstage']
});

let lookForKickUser = function(message, from) {
    let pattern = commands.kick.pattern,
        matches = pattern.exec(message),
        name;

    if(matches !== null || matches !== undefined) {
        name = matches[1];
    }
    else {
         return false;
    }

    bot.send('KICK','#thefirstage',name);
    bot.say(from, 'Kicked ' + name + ' from #thefirstage');

    return true;
}

let lookForLogChat = function(message, from) {
    return false;
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
        'Oh, no! Not ' + who + 'again.',
    ];

    return messages[Math.floor(Math.random() * messages.length)];

}

const commands = {
    kick: {
        pattern: /kick ([\w\-\d]+) */,
        command: lookForKickUser,
    }
};


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
    let command = message.args[1];

    for(type in commands) {
        if(commands[type].pattern.test(command)) {
            commands[type].command(command, from);
        }
    }
});


bot.addListener('error', function(message) {
    console.log('error: ', message);
});

//bot.send('MODE', '#yourchannel', '+o', 'yournick');
