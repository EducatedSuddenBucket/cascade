const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('technical info about the bot'),
    async execute(interaction) {
        await interaction.deferReply();
        
        const botPing = Date.now() - interaction.createdTimestamp;
        const apiPing = Math.round(client.ws.ping);

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(
                `**Latency:**\nBot latency is ${botPing}ms, API latency is ${apiPing}ms\n\n` +
                `**Uptime:**\nI've been online for:\n${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
