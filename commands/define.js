const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Get the definition of a word.')
        .addStringOption(option =>
            option
                .setName('word')
                .setDescription('The word to define')
                .setRequired(true)
        ),
    async execute(interaction) {
        const word = interaction.options.getString('word');
        await interaction.deferReply();

        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const definition = response.data[0]?.meanings[0]?.definitions[0]?.definition || 'Definition not found.';
            await interaction.editReply(`**${word}**: ${definition}`);
        } catch (error) {
            await interaction.editReply(`Could not find a definition for "${word}".`);
        }
    },
};
