document.getElementById('refreshButton').addEventListener('click', fetchServerData);

async function fetchServerData() {
    try {
        const response = await fetch('/monitor');
        const data = await response.json();
        displayServerData(data);
    } catch (error) {
        console.error('Error fetching server data:', error);
    }
}

function displayServerData(data) {
    const serverDataDiv = document.getElementById('serverData');
    serverDataDiv.innerHTML = '';

    data.forEach(server => {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server');

        const serverTitle = document.createElement('h2');
        serverTitle.textContent = `Server: ${server.server}`;
        serverDiv.appendChild(serverTitle);

        const requestCount = document.createElement('p');
        requestCount.textContent = `Requests: ${server.requests}`;
        serverDiv.appendChild(requestCount);

        const logsDiv = document.createElement('div');
        logsDiv.classList.add('logs');

        server.logs.forEach(log => {
            const logDiv = document.createElement('div');
            logDiv.classList.add('log');

            const timestamp = document.createElement('span');
            timestamp.classList.add('timestamp');
            timestamp.textContent = `[${new Date(log.timestamp).toLocaleString()}]`;
            logDiv.appendChild(timestamp);

            const details = document.createElement('span');
            details.classList.add('details');
            details.textContent = ` ${log.method} ${log.url} - Status: ${log.status}`;
            if (log.error) {
                details.textContent += ` - Error: ${log.error}`;
            }
            logDiv.appendChild(details);

            logsDiv.appendChild(logDiv);
        });

        serverDiv.appendChild(logsDiv);
        serverDataDiv.appendChild(serverDiv);
    });
}

// Fetch initial server data on page load
fetchServerData();
