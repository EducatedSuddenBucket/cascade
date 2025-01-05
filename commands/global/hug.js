module.exports = {
    name: 'hug',
    description: 'Sends a virtual hug to a user!',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user to hug',
            required: true,
        },
    ],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        await interaction.deferReply();
        await interaction.editReply(`${interaction.user} hugs ${user}! 🤗`);
    },
};
