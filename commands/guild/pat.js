module.exports = {
    name: 'pat',
    description: 'Sends a virtual pat to a user!',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user to pat',
            required: true,
        },
    ],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        await interaction.deferReply();
        await interaction.editReply(`${interaction.user} pats ${user}! 🥺`);
    },
};
