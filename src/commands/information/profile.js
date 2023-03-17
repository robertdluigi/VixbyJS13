const { Canvas } = require('canvas-constructor/napi-rs');
const { Attachment } = require('discord.js');
const { resolve, join } = require('path');
const Command = require("../../structures/Command");

const Guild = require("../../database/schemas/Guild");
const fetch = require('node-fetch'); // This is to fetch the user avatar and convert it to a buffer.
const imageUrlRegex = /\?size=2048$/g;
const placeholder = new Map();


module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "profile",
      description: "Profile",
      category: "Information",
      cooldown: 3,
    });
  }

  async run(message, args) {
    const client = message.client;
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const key = `${message.guild.id}-${message.author.id}`;
    
    if (!placeholder.has(key)) {
      placeholder.set(key, {
        user: message.author.id, guild: message.guild.id, points: 500, level: 17
      });
    }
    const buffer = await profile(message, placeholder.get(key));
    const filename = `profile-${message.author.id}.jpg`;
    const attachment = new Attachment(buffer, filename);
    await message.channel.send(attachment);
  }
}
  async function profile(message, score) {
  const key = `${message.guild.id}-${message.author.id}`;
  const member = message.member;
  const { level, points } = placeholder.get(key);

  try {
    const result = await fetch(member.user.displayAvatarURL);
    if (!result.ok) throw new Error('Failed to get the avatar!');
    const avatar = await result.buffer();

    const name = member.displayName.length > 30 ? member.displayName.substring(0, 17) + '...'
      : member.displayName;

    return new Canvas(400, 180)
      .setColor('#7289DA')
      .addRect(84, 0, 316, 180)
      .setColor("#2C2F33")
      .addRect(0, 0, 84, 180)
      .addRect(169, 26, 231, 46)
      .addRect(224, 108, 176, 46)
      .setShadowColor('rgba(22, 22, 22, 1)')
      .setShadowOffsetY(5)
      .setShadowBlur(10)
      .addCircle(84, 90, 62)
      .addCircularImage(avatar, 85, 90, 64)
      .save()
      .createBeveledClip(20, 138, 128, 32, 5)
      .setColor('#23272A')
      .fill()
      .restore()
      .setTextAlign('center')
      .setTextFont('18pt Klavika Regular')
      .setColor('#FFFFFF')
      .addText(name, 285, 54)
      .addText(`Level: ${level.toLocaleString()}`, 84, 159)
      .setTextAlign('left')
      .addText(`Score: ${points.toLocaleString()}`, 241, 136)
      .toBuffer();
  } 
  catch (error)  
  { 
    await message.channel.send(`An error occurred: **${error.message}**`);
  }
  };
