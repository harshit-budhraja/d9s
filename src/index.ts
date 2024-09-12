#!/usr/bin/env ts-node

import * as os from 'os';
import * as blessed from 'blessed';
import Docker from 'dockerode';

// Create a screen object.
const screen = blessed.screen({
  smartCSR: true,
  title: 'dkr'
});

// Create a box to show environment metadata.
const envBox = blessed.box({
  top: 'left',
  left: 'left',
  width: '100%',
  height: '40%',
  content: '',
  tags: true,
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    }
  }
});

screen.append(envBox);

// Create a box for displaying container information
const containersBox = blessed.box({
  top: '12%',
  left: 'center',
  width: '100%',
  height: '100%',
  label: ' {bold}{cyan-fg}Containers{/cyan-fg}{/bold} ',
  tags: true,
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#00afff'
    }
  }
});

screen.append(containersBox);

// Initialize Docker client
const docker = new Docker();

// Utility function to create formatted text with colors
const createText = ({ content, bold = false, color = 'white' }: { content: string; bold?: boolean; color?: string; }): string => {
  const colorMap: {
    [key: string]: string;
  } = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#ffff00',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    cyan: '#00ffff',
    gray: '#808080',
    dkr_brown: '#dc3a28',
    dkr_blue: '#0f63cc',
    dkr_gray: '#b6b1b7',
  };

  color = colorMap[color] || colorMap['white'];
  return `{${color}-fg}${bold ? '{bold}' : ''}${content}${bold ? '{/bold}' : ''}{/${color}-fg}`;
};

// Fetch Docker version and system information.
async function fetchInfo() {
  const username = os.userInfo().username ?? "n/a";
  const dkrVersion = "v0.0.1";
  const dockerInfo = await docker.version();
  const cpuCount = os.cpus().length.toString();
  const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2); // Convert to GB

  const content = `${createText({ content: 'User:', color: 'orange' })} ${createText({ content: username, bold: true })}                             ${createText({ content: '<?>', bold: true, color: 'dkr_blue' })} ${createText({ content: 'Help', color: 'dkr_gray' })}
${createText({ content: 'Dkr Rev:', color: 'orange' })} ${createText({ content: dkrVersion, bold: true })}                             ${createText({ content: '<q>', bold: true, color: 'dkr_blue' })} ${createText({ content: 'Quit', color: 'dkr_gray' })}
${createText({ content: 'Docker Rev:', color: 'orange' })} ${createText({ content: dockerInfo.Version, bold: true })}
${createText({ content: 'CPUs:', color: 'orange' })} ${cpuCount !== "n/a" ? createText({ content: cpuCount, bold: true }) : createText({ content: cpuCount, bold: true, color: 'dkr_brown' })}
${createText({ content: 'MEM:', color: 'orange' })} ${totalMemory !== "n/a" ? createText({ content: `${totalMemory}GB`, bold: true }) : createText({ content: `${totalMemory}GB`, bold: true, color: 'dkr_brown' })}
`;

  envBox.setContent(content);
  screen.render();

  // Fetch and display Docker containers
  await updateContainers();
}

// Function to update containers information
async function updateContainers() {
  try {
    const containers = await docker.listContainers();
    const containersContent = containers.map(container => {
      return `${createText({ content: 'ID:', color: 'cyan' })} ${container.Id.slice(0, 12)} ${createText({ content: 'Name:', color: 'cyan' })} ${container.Names.join(', ')} ${createText({ content: 'Image:', color: 'cyan' })} ${container.Image} ${createText({ content: 'Status:', color: 'cyan' })} ${container.Status}`;
    }).join('\n');

    containersBox.setContent(containersContent || 'No containers found');
    screen.render();
  } catch (error: any) {
    containersBox.setContent(`Error fetching containers: ${error.message}`);
    screen.render();
  }
}

// Exit on `q`, or `Ctrl-C`.
screen.key(['q', 'C-c'], function () {
  return process.exit(0);
});

fetchInfo();
