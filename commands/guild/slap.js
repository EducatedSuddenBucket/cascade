module.exports = {
    name: 'slap',
    description: 'Sends a playful slap to a user!',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user to slap',
            required: true,
        },
    ],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        await interaction.deferReply();
        await interaction.editReply(`${interaction.user} slaps ${user}! 👋`);
    },
};
