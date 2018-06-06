// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client('irc.mibbit.com', 'FAbot', {
	channels: ['#thefirstage']
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
bot.addListener("pm", function(from, to, text, message) {
    //console.log(from);
    //console.log(to);
    //console.log(text);
    //console.log(message);
	let kick = lookForKickUser(text.args[1], from);
    let log = lookForLogChat(text.args[1],from);

    if(! kick || ! log) {
        bot.say(to,'Unable to do as you asked.');
    }

});


bot.addListener('error', function(message) {
    console.log('error: ', message);
});

//bot.send('MODE', '#yourchannel', '+o', 'yournick');

function lookForKickUser(message, from) {
    let pattern = /kick ([\w\-\d]+) */,
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

function lookForLogChat(message, from) {
    return false;
}

function randomWelcome(who) {
    let messages = [
        who + ', welcome back!',
        who + ', what\'s new?',
        'Howdy, ' + who + '!',
        'Hey there, ' + who + "!",
        ', what\'s happenin\', ' + who + "?",
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
