import express from 'express';
const expressApp = express();

import cors from 'cors';
expressApp.use(cors()); // allow cross-origin requests for PHP proxy to run properly

import WeatherApp from './apps/weather/weather-app';
const weatherApp = new WeatherApp();

const APP_PORT = 8181;

expressApp.listen(APP_PORT, () => {
  console.log(`Web server is listening on port ${APP_PORT}`);
});
expressApp.get('/weather', (req, res) => {
    weatherApp.handleRequest(req).then(response => {
        res.json(response);
    }).catch(err => {
        res.json(err);
    });
});
