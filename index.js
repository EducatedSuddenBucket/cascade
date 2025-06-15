const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
let token, clientId, port;

try {
  const config = require('./config.json');
  token = process.env.TOKEN || config.token;
  clientId = process.env.CLIENT_ID || config.clientId;
  port = process.env.PORT || config.port || 3000;
} catch {
  token = process.env.TOKEN;
  clientId = process.env.CLIENT_ID;
  port = process.env.PORT || 3000;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
client.commands = new Collection();

const commands = [];

// Load commands from the commands folder
const commandsPath = path.join(__dirname, 'commands');
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

// Register (slash) commands with Discord
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

// Log in the Discord client
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
    await interaction.reply({
      content: 'There was an error executing this command!',
      ephemeral: true
    });
  }
});
client.login(token);

/* --- Express Web Server --- */
const app = express();
app.get('/icon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'icon.png'));
});
app.get('/', (req, res) => {
  // Build table rows dynamically using the commands stored in client.commands
  let rows = '';
  client.commands.forEach(command => {
    // Convert the SlashCommandBuilder instance to a plain object
    const cmdData = command.data.toJSON();
    const name = cmdData.name;
    const description = cmdData.description;
    // Build a basic usage string: e.g. /8ball [question]
    let usage = `/${name}`;
    if (cmdData.options && cmdData.options.length > 0) {
      for (const option of cmdData.options) {
        usage += ` [${option.name}]`;
      }
    }
    rows += `<tr>
      <td>/${name}</td>
      <td>${description}</td>
      <td><span class="usage">${usage}</span></td>
    </tr>`;
  });

  // HTML content (with the provided CSS)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    body {
      background: #1a1a1a;
      color: white;
      line-height: 1.6;
    }
    .hero {
      background: #1a1a1a;
      padding: 4rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .avatar {
      width: 128px;
      height: 128px;
      border-radius: 50%;
      border: 4px solid #3B82F6;
      margin-bottom: 1rem;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #3B82F6;
    }
    .hero p {
      font-size: 1.2rem;
      color: #ffffff;
      margin-bottom: 1.5rem;
    }
    .invite-button {
      background: #3B82F6;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    .invite-button:hover {
      background: #2563EB;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      background: #2a2a2a;
      border-radius: 10px;
      overflow: hidden;
    }
    th {
      background: #3B82F6;
      padding: 1rem;
      text-align: left;
    }
    td {
      padding: 1rem;
      border-top: 1px solid #404040;
    }
    tr:hover {
      background: #333;
    }
    .usage {
      background: #404040;
      padding: 0.5rem;
      border-radius: 5px;
      font-family: monospace;
      color: #10B981;
    }
  </style>
  <title>Cascade</title>
    <link rel="icon" href="/icon.png" type="image/png">
  <meta property="og:title" content="Cascade - A random Discord Bot">
  <meta property="og:description" content="Cascade is a Discord Bot">
  <meta property="og:image" content="/icon.png">
  <meta property="og:url" content="https://cascade.esb.is-a.dev">
</head>
<body>
  <div class="hero">
    <img src="/icon.png" alt="Cascade Bot" class="avatar">
    <h1>Cascade</h1>
    <p>Cascade - A Discord bot that makes your server more engaged and fun.</p>
    <a href="https://discord.com/oauth2/authorize?client_id=1283690429593813002" class="invite-button">Invite/Install</a>
  </div>
  <div class="container">
    <table>
      <thead>
        <tr>
          <th>Command</th>
          <th>Description</th>
          <th>Usage</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Web server is running on port ${port}`);
});

