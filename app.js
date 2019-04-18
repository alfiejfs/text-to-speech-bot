const Discord = require('discord.js');
const tts = require('google-tts-api');
const fs = require('fs').promises;
const util = require('util');
const download = util.promisify(require('download-file'));
const config = require('./config.json');


const client = new Discord.Client();

const usage = new Discord.RichEmbed()
  .setTitle("Invalid Usage!")
  .setColor(0xFF0000)
  .setDescription(".ttmp3 <message less than or equal to 200 characters>");

let awaiting = [];

client.on('message', message => {
  if (awaiting.includes(message.author.id)) return;

  if (message.content.startsWith(`${config.prefix}ttmp3`)) {
    awaiting.push(message.author.id);

    let toMp3 = message.content.split(" ");
    toMp3.shift();
    toMp3 = toMp3.join(" ");

    let options = {
      directory: `./${config.audio_directory}`,
      filename: `${message.author.id}.mp3`
    }

    tts(toMp3, 'en', 1)
      .then(url => {
        download(url, options)
          .then(() =>
            message.channel.send({
              files: [{
                attachment: `${options.directory}/${options.filename}`,
                name: `${message.author.id}.mp3`
              }]
            })
          )
          .then(msg => {
            //fs.unlink(`${options.directory}/${options.filename}`)
            removeAwaiting(message.author.id);
          })
          .catch(err => {
            console.error(error);
            removeAwaiting(message.author.id);
          });
      })
      .catch(err => {
        message.channel.send(usage);
        removeAwaiting(message.author.id);
      });
  }
});


function removeAwaiting(id) {
  awaiting = awaiting.filter(awaiter => awaiter != id);
}

client.login(config.token);
