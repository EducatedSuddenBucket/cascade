const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Displays bot latency and uptime',
    async execute(interaction) {
        await interaction.deferReply();
        
        // Calculate bot and API latency
        const botPing = Date.now() - interaction.createdTimestamp;
        const apiPing = interaction.client.ws.ping;

        // Calculate bot uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        // Create the embed message
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(
                `**Latency:**\nBot latency is ${botPing}ms, API latency is ${apiPing}ms\n\n` +
                `**Uptime:**\nI've been online for:\n${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`
            )
            .setColor('#0099ff')
            .setTimestamp();

        // Send the reply
        await interaction.editReply({ embeds: [embed] });
    },
};
