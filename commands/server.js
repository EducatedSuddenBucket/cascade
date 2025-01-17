const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setContexts(InteractionContextType.Guild)
        .setDescription('Displays information about the server.'),
    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();

        const serverInfoEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${guild.name}'s Info`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `${owner.user.tag} (${owner.user.id})`, inline: true },
                { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
                { name: 'Created On', value: new Date(guild.createdTimestamp).toLocaleDateString(), inline: true },
                { name: '\u200B', value: '\u200B' }, // Adding an empty field to avoid the error
            );

        await interaction.deferReply();
        await interaction.editReply({ embeds: [serverInfoEmbed] });
    },
};
