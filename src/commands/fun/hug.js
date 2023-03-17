const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const discord = require("discord.js");

const axios = require('axios');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "hug",
      aliases: ["huguser"],
      description: "Hug someone",
      category: "Fun",
      usage: "[user]",
      examples: ["hug @Peter"],
      cooldown: 3,
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);
    const url = 'https://some-random-api.ml/animu/hug';
    
    let response, data;
    try {
        response = await axios.get(url);
        data = response.data;
    } catch (e) {
        return;
    }
    
    const target = message.mentions.users.last();
    const authorId = message.author.id;
    const author = message.author.username;
    const img = data.link;
    let embedd = new discord.MessageEmbed()
      .setColor("GREEN")
      .setImage(img)
      .setDescription(`${author} hugs himself`);

    if (target === authorId) {
      message.channel.sendCustom(embedd);
    }
    if (!target) return message.channel.sendCustom(embedd);
    let targett = target.username;
    let embed = new discord.MessageEmbed()
      .setColor("GREEN")
      .setImage(img)
      .setDescription(`${author} hugged ${targett}`);
    message.channel.sendCustom({ embeds: [embed] });
  }
};
