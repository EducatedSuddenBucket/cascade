const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Ensure axios is installed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomfact')
        .setDescription('Replies with a random fact.'),
    async execute(interaction) {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const fact = response.data.text; // Extract fact from API response

            const embed = new EmbedBuilder()
                .setColor('#0099ff') // Cool blue color
                .setTitle('Random Fact')
                .setDescription(fact)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Oops! Something went wrong while fetching the fact.');
        }
    },
};
