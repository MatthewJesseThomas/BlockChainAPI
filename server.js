const express = require('express');
const route = require('./controller');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Port = parseInt(process.env.PORT) || 4000;
const app = express();
const { errorHandling } = require('./middleware/ErrorHandling');
const cessate = 'Ctrl + C';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

app.use(route);
app.use(cors(), cookieParser(), express.json(), express.urlencoded({ extended: false }));
app.post('/api/endpoint', (req, res) => {
    const formData = req.body; // Access the incoming form data here
    // Process the formData as needed (e.g., store in the database, send email, etc.)
    console.log('Received form data:', formData);
    res.json({ message: 'Form data received successfully' });
});


app.listen(Port, () => {
    console.log(`Server SStreaming on Port: ${Port}`);
    console.log(`Cessation of Server: ${cessate}`);
});
app.use(errorHandling);