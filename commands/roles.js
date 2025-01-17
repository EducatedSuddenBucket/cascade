const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, IntegrationType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes([IntegrationType.GuildInstall]);
        .setDescription('Lists all roles in the server with their hex color code.'),

    async execute(interaction) {
        const { guild } = interaction;
        const roles = guild.roles.cache.sort((a, b) => b.position - a.position);

        const rolesEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Roles in ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }));

        let roleFields = [];
        roles.forEach(role => {
            roleFields.push({
                name: role.name,
                value: `ID: ${role.id} | Color: ${role.hexColor} | Members: ${role.members.size}`,
                inline: false
            });
        });

        rolesEmbed.addFields(roleFields);

        await interaction.deferReply();
        await interaction.editReply({ embeds: [rolesEmbed] });
    },
};
