const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Check Minecraft server status')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Server IP address')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Server type (java/bedrock)')
                .setRequired(true)
                .addChoices(
                    { name: 'Java', value: 'java' },
                    { name: 'Bedrock', value: 'bedrock' }
                )),

    async execute(interaction) {
        await interaction.deferReply();
        
        const serverIp = interaction.options.getString('ip');
        const serverType = interaction.options.getString('type');
        
        try {
            if (serverType === 'java') {
                const [statusResponse, iconResponse] = await Promise.all([
                    fetch(`https://heatblock.esb.is-a.dev/api/status/${serverIp}`),
                    fetch(`https://heatblock.esb.is-a.dev/api/png/${serverIp}`)
                ]);

                const status = await statusResponse.json();

                if (status.error) {
                    throw new Error(status.error);
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${serverIp} - Java Server Status`)
                    .setColor('#00ff00')
                    .setTimestamp();

                if (iconResponse.ok) {
                    embed.setThumbnail(`https://heatblock.esb.is-a.dev/api/png/${serverIp}`);
                }

                embed.addFields(
                    { name: 'Version', value: status.version.name, inline: true },
                    { name: 'Protocol', value: status.version.protocol.toString(), inline: true },
                    { name: 'Players', value: `${status.players.online}/${status.players.max}`, inline: true },
                    { name: 'Latency', value: `${status.latency}ms`, inline: true },
                    { name: 'MOTD', value: status.description || 'No description', inline: false }
                );

                if (status.players.list && status.players.list.length > 0) {
                    const playerList = status.players.list
                        .map(player => player.name)
                        .join(', ');
                    embed.addFields({ name: 'Online Players', value: playerList });
                }

                await interaction.editReply({ embeds: [embed] });

            } else if (serverType === 'bedrock') {
                const response = await fetch(`https://heatblock.esb.is-a.dev/api/status/bedrock/${serverIp}`);
                const status = await response.json();

                if (status.error) {
                    throw new Error(status.error);
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${serverIp} - Bedrock Server Status`)
                    .setColor('#00ff00')
                    .setTimestamp()
                    .addFields(
                        { name: 'MOTD', value: status.motd, inline: false },
                        { name: 'Version', value: status.version, inline: true },
                        { name: 'Protocol', value: status.protocol, inline: true },
                        { name: 'Players', value: `${status.playersOnline}/${status.playersMax}`, inline: true },
                        { name: 'Gamemode', value: status.gamemode, inline: true },
                        { name: 'Level Name', value: status.levelName, inline: true },
                        { name: 'Latency', value: `${status.latency}ms`, inline: true }
                    );

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            const errorMessages = {
                'timeout': 'Server request timed out',
                'domain_not_found': 'Server domain not found',
                'offline': 'Server is offline',
                'no_favicon': 'Server has no icon',
                'invalid_favicon': 'Server has an invalid icon',
                'cant_fetch_favicon': 'Could not fetch server icon'
            };

            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(errorMessages[error.message] || 'An unknown error occurred')
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
