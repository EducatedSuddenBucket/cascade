const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('technical info about the bot'),
    async execute(interaction) {
        try {
            

            await interaction.deferReply();
            
            const botPing = Date.now() - interaction.createdTimestamp;
            const apiPing = interaction.client.ws.ping;

            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;
            const seconds = Math.floor(uptime % 60);

            const embed = new EmbedBuilder()
                .setTitle('Bot Information')
                .setDescription(
                    `**Latency:**\nBot latency is ${botPing}ms, API latency is ${apiPing}ms\n\n` +
                    `**Uptime:**\nI've been online for:\n${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`
                )
                .setColor('#0099ff')
                .setTimestamp();

            if (!interaction.deferred && !interaction.replied) {
                console.log('Interaction not deferred, cannot edit reply');
                return;
            }

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in bot command:', error);
            
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: 'There was an error processing this command!', 
                        ephemeral: true 
                    });
                } else if (interaction.deferred) {
                    await interaction.editReply({ 
                        content: 'There was an error processing this command!' 
                    });
                }
            } catch (followUpError) {
                console.error('Failed to send error message:', followUpError);
            }
        }
    },
};
