const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Check Minecraft server status')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Server IP address')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('edition')
                .setDescription('Server type (java/bedrock)')
                .setRequired(true)
                .addChoices(
                    { name: 'Java', value: 'java' },
                    { name: 'Bedrock', value: 'bedrock' }
                )),

    async execute(interaction) {
        await interaction.deferReply();
        
        const serverIp = interaction.options.getString('ip');
        const serverType = interaction.options.getString('edition');
        
        try {
            if (serverType === 'java') {
                const response = await axios.get(`https://heatblock.esb.is-a.dev/api/status/${serverIp}`);
                const status = response.data;

                if (!status.success) {
                    throw new Error(status.error.message || status.error.code);
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${serverIp} - Java Server Status`)
                    .setColor('#00ff00')
                    .setThumbnail(`https://heatblock.esb.is-a.dev/api/png/${serverIp}`)
                    .setTimestamp();

                embed.addFields(
                    { name: 'Version', value: status.version.name, inline: true },
                    { name: 'Protocol', value: status.version.protocol.toString(), inline: true },
                    { name: 'Players', value: `${status.players.online}/${status.players.max}`, inline: true },
                    { name: 'Latency', value: `${status.latency}ms`, inline: true },
                    { name: 'MOTD', value: status.description_clean || status.description || 'No description', inline: false }
                );

                if (status.players.list && status.players.list.length > 0) {
                    const playerList = status.players.list.map(player => player.name).join(', ');
                    embed.addFields({ name: 'Online Players', value: playerList });
                }

                await interaction.editReply({ embeds: [embed] });
            } else if (serverType === 'bedrock') {
                const response = await axios.get(`https://heatblock.esb.is-a.dev/api/status/bedrock/${serverIp}`);
                const status = response.data;

                if (!status.success) {
                    throw new Error(status.error.message || status.error.code);
                }

                const formatValue = (value) => value?.toString() || 'N/A';

                const embed = new EmbedBuilder()
                    .setTitle(`${serverIp} - Bedrock Server Status`)
                    .setColor('#00ff00')
                    .setTimestamp()
                    .addFields(
                        { name: 'MOTD', value: status.motd_clean || status.motd || 'No MOTD', inline: false },
                        { name: 'Version', value: formatValue(status.version), inline: true },
                        { name: 'Protocol', value: formatValue(status.protocol), inline: true },
                        { name: 'Players', value: `${formatValue(status.playersOnline)}/${formatValue(status.playersMax)}`, inline: true },
                        { name: 'Gamemode', value: formatValue(status.gamemode), inline: true },
                        { name: 'Level Name', value: formatValue(status.levelName), inline: true },
                        { name: 'Latency', value: `${formatValue(status.latency)}ms`, inline: true }
                    );

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error details:', error);

            const errorEmbed = new EmbedBuilder()
                .setTitle('Server Status Error')
                .setDescription(error.message || 'An error occurred while checking the server status')
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
