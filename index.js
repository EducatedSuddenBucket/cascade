const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, clientId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '>';  // Set your prefix

client.commands = new Collection();

const userCommands = [];
const guildCommands = [];
const globalCommands = [];

const loadCommands = (commandsPath, type) => {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            // Add integration_types and contexts based on the folder
            const commandData = command.data.toJSON();
            
            switch (type) {
                case 'user':
                    commandData.integration_types = [1];  // USER_INSTALL
                    commandData.contexts = [1, 2];        // BOT_DM, PRIVATE_CHANNEL
                    userCommands.push(commandData);
                    break;
                case 'guild':
                    commandData.integration_types = [0];  // GUILD_INSTALL
                    commandData.contexts = [0];           // GUILD
                    guildCommands.push(commandData);
                    break;
                case 'global':
                    commandData.integration_types = [0, 1];  // GUILD_INSTALL and USER_INSTALL
                    commandData.contexts = [0, 1, 2];        // GUILD, BOT_DM, PRIVATE_CHANNEL
                    globalCommands.push(commandData);
                    break;
                default:
                    console.log(`[WARNING] Unknown command type for ${filePath}`);
            }
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

// Load commands from specific directories
const commandsPath = path.join(__dirname, 'commands');
loadCommands(path.join(commandsPath, 'user'), 'user');
loadCommands(path.join(commandsPath, 'guild'), 'guild');
loadCommands(path.join(commandsPath, 'global'), 'global');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        // Register global commands
        console.log(`Started refreshing ${globalCommands.length} global application (/) commands.`);
        const globalData = await rest.put(
            Routes.applicationCommands(clientId),
            { body: globalCommands },
        );
        console.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);

        // Register user-specific commands (installed per user)
        console.log(`Started refreshing ${userCommands.length} user-specific (/) commands.`);
        const userData = await rest.put(
            Routes.applicationCommands(clientId),
            { body: userCommands },
        );
        console.log(`Successfully reloaded ${userData.length} user-specific (/) commands.`);

    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

client.on(Events.GuildCreate, async guild => {
    try {
        console.log(`Registering guild-specific commands for guild ${guild.id}.`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guild.id),
            { body: guildCommands },
        );
        console.log(`Successfully registered guild-specific commands for guild ${guild.id}.`);
    } catch (error) {
        console.error(error);
    }
});

// Message-based command handler (using prefix)
client.on('messageCreate', async message => {
    // Ignore messages from bots or without the prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args);  // Modify command files to handle message + args
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.login(token);
