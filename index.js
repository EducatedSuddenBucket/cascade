const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, clientId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '>';  // Set your prefix

client.commands = new Collection();

const commands = [];

const loadCommands = (commandsPath) => {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            // Add integration_types to the command data
            const commandData = command.data.toJSON();
            commandData.integration_types = [0, 1];
            commandData.contexts = [0, 1]// or [1] or [0] depending on your needs
            commands.push(commandData);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

// Load commands from both the commands folder and subfolders
const foldersPath = path.join(__dirname, 'commands');
loadCommands(foldersPath);

const commandFolders = fs.readdirSync(foldersPath).filter(file => fs.statSync(path.join(foldersPath, file)).isDirectory());
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    loadCommands(commandsPath);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
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
            { body: commands },
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
