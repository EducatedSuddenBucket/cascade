const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Sends a playful slap to a user!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to slap')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        await interaction.deferReply();
        await interaction.editReply(`${interaction.user} slaps ${user}! 👋`);
    },
};
