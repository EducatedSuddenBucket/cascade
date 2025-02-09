const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a die with a given number of sides and dice.')
        .addIntegerOption(option =>
            option
                .setName('sides')
                .setDescription('Number of sides on the dice (max 100).')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('Number of dice to roll (max 10, default is 1).')
                .setRequired(false)
        ),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides');
        const number = interaction.options.getInteger('number') || 1;

        // Enforce limits
        if (sides < 2 || sides > 100) {
            return interaction.reply({ content: '❌ Dice sides must be between **2 and 100**.', ephemeral: true });
        }
        if (number < 1 || number > 10) {
            return interaction.reply({ content: '❌ You can roll between **1 and 10** dice.', ephemeral: true });
        }

        // Roll the dice
        const rolls = Array.from({ length: number }, () => Math.floor(Math.random() * sides) + 1);
        await interaction.reply(`🎲 You rolled **${rolls.join(', ')}**`);
    },
};
