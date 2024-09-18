const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, clientId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '>';  // Set your prefix

client.commands = new Collection();

const commands = [];

// Load commands based on folder type (user, guild, global)
const loadCommands = (commandsPath, folderType) => {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);

            // Convert command data to JSON
            const commandData = command.data.toJSON();

            // Set integration types and contexts based on the folder type
            if (folderType === 'user') {
                commandData.integration_types = [1];  // USER_INSTALL
                commandData.contexts = [0, 1, 2];     // GUILD, BOT_DM, PRIVATE_CHANNEL
            } else if (folderType === 'global') {
                commandData.integration_types = [0, 1];  // GUILD_INSTALL, USER_INSTALL
                commandData.contexts = [0, 1, 2];        // GUILD, BOT_DM, PRIVATE_CHANNEL
            }
            // For guild commands, no need to set integration_types and contexts

            commands.push(commandData);
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
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
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
        console.log(`Registering commands for guild ${guild.id}.`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guild.id),
            { body: commands.filter(cmd => !cmd.integration_types || cmd.integration_types.includes(0)) },  // Register only guild-related commands
        );
        console.log(`Successfully registered commands for guild ${guild.id}.`);
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
