const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Generate a QR code for a given text or URL.')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The text or URL to convert into a QR code.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=200`;

        await interaction.reply(`🖼 **Here’s your QR Code:**\n${qrUrl}`);
    },
};
