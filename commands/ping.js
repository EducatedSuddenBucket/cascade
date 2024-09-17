const { InteractionResponseType, MessageFlags, ComponentType, ApplicationIntegrationType, InteractionContextType } = require('discord-api-types/payloads');

module.exports = {
    data: {
        name: 'ping',
        description: 'Responds with Pong!',
        contexts: {
            installation: [
                ApplicationIntegrationType.GuildInstall,
                ApplicationIntegrationType.UserInstall,
            ],
            interaction: [
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel,
            ],
        },
    },
    async execute(interaction) {
        const embed = {
            title: 'Ping Command',
            description: 'Pong!',
            color: 0x00FF00,
        };

        await interaction.reply({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            },
        });
    },
};
