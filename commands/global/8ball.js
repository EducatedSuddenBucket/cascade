const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Replies with a random 8ball response!')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The question to ask the 8ball')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply();

        const responses = [
            'Without a doubt.',
            'Yes – definitely.',
            'As I see it, yes.',
            'Most likely.',
            'Signs point to yes.',
            'My reply is no.',
            'My sources say no.',
            'Very doubtful.',
            'No way.'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        await interaction.editReply(`🎱 **Question:** ${question}\n**Answer:** ${response}`);
    },
};
