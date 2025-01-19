const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Lists all roles in the server with their colors'),
    async execute(interaction) {
        await interaction.deferReply();
        
        // Get all roles from the server excluding @everyone
        const roles = interaction.guild.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position); // Sort by position (highest first)
        
        // Create description with all roles
        const roleList = roles.map(role => 
            `**${role.name}** - #${role.hexColor.toUpperCase()}`
        ).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Server Roles')
            .setDescription(roleList)
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: `Total roles: ${roles.size}` });

        await interaction.editReply({ embeds: [embed] });
    },
};
