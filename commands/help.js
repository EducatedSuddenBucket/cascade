const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands'),
    async execute(interaction) {
        await interaction.deferReply();
        
        // Get all commands from the client
        const commands = Array.from(interaction.client.commands.values());
        
        // Create description with all commands
        const commandList = commands.map(cmd => 
            `**/${cmd.data.name}** - ${cmd.data.description}`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription(commandList)
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Use /help to see this message again' });

        await interaction.editReply({ embeds: [embed] });
    },
};
