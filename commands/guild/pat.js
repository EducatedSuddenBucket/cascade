const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Sends a virtual pat to a user!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to pat')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        await interaction.deferReply();
        await interaction.editReply(`${interaction.user} pats ${user}! 🥺`);
    },
};
