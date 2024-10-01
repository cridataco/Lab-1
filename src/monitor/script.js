document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.getElementById('refreshButton');
    const serverData = document.getElementById('serverData');
    const serverTokens = document.getElementById('serverTokens');

    refreshButton.addEventListener('click', () => {
        fetch('http://localhost:5001/monitor')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                serverData.innerHTML = ''; // Clear existing data
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
                        timestamp.textContent = new Date(log.timestamp).toLocaleString();
                        logDiv.appendChild(timestamp);

                        const details = document.createElement('div');
                        details.classList.add('details');
                        details.textContent = `Method: ${log.method}, URL: ${log.url}, Status: ${log.status}`;
                        logDiv.appendChild(details);

                        logsDiv.appendChild(logDiv);
                    });

                    serverDiv.appendChild(logsDiv);
                    serverData.appendChild(serverDiv);

                    // Create canvas for the chart
                    const chartCanvas = document.createElement('canvas');
                    chartCanvas.id = `chart-${server.server}`;
                    serverDiv.appendChild(chartCanvas);

                    console.log(`Creating chart for ${chartCanvas.id}`);

                    // Create the chart for the request logs
                    createChart(server.logs, `chart-${server.server}`);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                serverData.innerHTML = `<p style="color: red;">Error fetching data: ${error.message}</p>`;
            });
    });

    sendRequest.addEventListener('click', () => {
        const data = this.getElementById('requestData');
        console.log(data.value);
        fetch('http://localhost:5001/api/tokens', {
                body: data.value, 
                method: 'POST'}
            )
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                serverTokens.innerHTML = ''; 
        
                const serverToken = document.createElement('div');
                serverTokens.classList.add('server');
                
                const requestCount = document.createElement('p');
                requestCount.textContent = `Tokens: ${data.tokens}`;
                
                serverTokens.appendChild(requestCount);
                serverTokens.appendChild(serverToken);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                serverTokens.innerHTML = `<p style="color: red;">Error fetching data: ${error.message}</p>`;
            });
    });

    function createChart(logs, chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error(`Canvas with id ${chartId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const timestamps = logs.map(log => new Date(log.timestamp).toLocaleTimeString());
        const requestCounts = logs.map(log => log.status);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Request Status Over Time',
                    data: requestCounts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
