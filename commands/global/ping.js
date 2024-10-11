const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot and api Latency'),
    async execute(interaction) {
        const botPing = interaction.client.ws.ping; // Bot's WebSocket ping
        const apiPing = Date.now() - interaction.createdTimestamp; // API ping

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .addFields(
                { name: 'Bot', value: `${botPing}ms`, inline: true },
                { name: 'API', value: `${apiPing}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
