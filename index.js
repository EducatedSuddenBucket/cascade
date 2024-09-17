const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, clientId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const commands = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
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

client.on(Events.GuildDelete, async guild => {
    try {
        console.log(`Removing commands for guild ${guild.id}.`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guild.id),
            { body: [] },
        );
        console.log(`Successfully removed commands for guild ${guild.id}.`);
    } catch (error) {
        console.error(error);
    }
});

// Handle user command registration
client.on(Events.GuildMemberAdd, async member => {
    try {
        console.log(`Registering commands for user ${member.id}.`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, member.guild.id),
            { body: commands },
        );
        console.log(`Successfully registered commands for user ${member.id}.`);
    } catch (error) {
        console.error(error);
    }
});

client.login(token);
