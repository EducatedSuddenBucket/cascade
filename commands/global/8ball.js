module.exports = {
    name: '8ball',
    description: 'Replies with a random 8ball response!',
    options: [
        {
            name: 'question',
            type: 3,
            description: 'The question to ask the 8ball',
            required: true,
        },
    ],
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
