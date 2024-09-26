const express = require('express');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.post('/tokens', (req, res) => {
    const { text } = req.body;
    const tokens = text.split(' ').length;
    res.json({ tokens });
});

app.listen(port, () => {
    console.log(`Instance running on port ${port}`);
    // Registrar la instancia con el Discovery Server
    axios.post('http://localhost:3000/register', { server: `http://localhost:${port}` })
        .then(() => console.log(`Registered with Discovery Server`))
        .catch(error => console.error(`Failed to register: ${error.message}`));
});