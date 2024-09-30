document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.getElementById('refreshButton');
    const serverData = document.getElementById('serverData');

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

                    // Create the chart for the request logs
                    createChart(server.logs, `chart-${server.server}`);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                serverData.innerHTML = `<p style="color: red;">Error fetching data: ${error.message}</p>`;
            });
    });

    function createChart(logs, chartId) {
        const ctx = document.getElementById(chartId).getContext('2d');
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
