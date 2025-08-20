const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const path = require('path');

const chokidar = require('chokidar');

const port = 2100;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const watcher = chokidar.watch([
	'**/*.html',
	'**/*.css',
	'**/*.png',
	'**/*.svg',
	'github/**/*.twig',
	'deps/_deps/**/*.js',
	'!node_modules/**',
], {
	persistent: true,
	ignoreInitial: true,
	cwd: process.cwd(),
});

watcher
  .on('add', (path) => handleChange(path))
  .on('change', (path) => handleChange(path))
  .on('unlink', (path) => handleChange(path));

function handleChange(path) {
	broadcastMessage('reload');
}

let tmr;

// WebSocket connection handling
wss.on('connection', (ws) => {
	console.log('Client connected to WebSocket');

	// You can handle messages from clients if needed
	ws.on('message', (message) => {
        if (tmr) clearTimeout(tmr);

		console.log(`Received message: ${message}`);
	});

	// Event listener for when the connection is closed
	ws.on('close', () => {
        // kill the process after 10 seconds if nothing connects. This will stop the server running in the background
        // tmr = setTimeout(() => {
        //     console.log('Hot reload server was closed');
        //     process.exit();
        // }, 10000);

		console.log('Client disconnected from WebSocket');
	});
});


// Function to broadcast a message to all connected clients
function broadcastMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Simulate a file change and trigger a reload
// function simulateFileChange() {
//     console.log('Simulating file change');
//     broadcastMessage('reload'); // Send a 'reload' message to connected clients
// }

// Simulate file changes periodically
// setInterval(simulateFileChange, 5000);

// ... Your existing app.listen code ...

server.listen(port, () => {
    console.log(`\nHot reload running on port ${port}`);
});