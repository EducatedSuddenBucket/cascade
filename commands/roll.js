const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a die of a given size (e.g., /roll 6 or /roll 6 3).')
        .addIntegerOption(option =>
            option
                .setName('size')
                .setDescription('Number of sides on the dice (e.g., 6 for d6).')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('Number of dice to roll (default is 1).')
                .setRequired(false)
        ),
    async execute(interaction) {
        const size = interaction.options.getInteger('size');
        const number = interaction.options.getInteger('number') || 1;

        if (size < 2 || number < 1) {
            return interaction.reply({ content: 'Invalid input! Dice must have at least 2 sides and roll at least 1 die.', ephemeral: true });
        }

        let rolls = [];
        for (let i = 0; i < number; i++) {
            rolls.push(Math.floor(Math.random() * size) + 1);
        }

        await interaction.reply(`🎲 **Rolling ${number}d${size}** → ${rolls.join(', ')} (Total: **${rolls.reduce((a, b) => a + b)}**)`);
    },
};
