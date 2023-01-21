import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';

import Http from "./Http";

import {
  CITIES,
  weatherLabels,
  weatherValues
} from "./weather-constants";
import { DB_CONFIG } from './db-config'

const PORT = 8181;

const http = new Http();
const expressApp = express();

expressApp.use(cors()); // allow cross-origin requests for PHP proxy to run properly
expressApp.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});
expressApp.get('/weather', (req, res) => {
  const labels = {...weatherLabels};
  const values = {...weatherValues};
  const allValues = [];

  function requestWeather(groupName, latitude, longitude, index) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    return http.makeRequest(url).then(response => {
      allValues.push(values[groupName][index] = Number(response.current_weather.temperature));
    }).catch(err => console.error(err));
  }

  Promise.all(
    Object.keys(CITIES).map(groupName => {
      return Object.keys(CITIES[groupName]).map((cityName, index) => {
        return requestWeather(
            groupName,
            CITIES[groupName][cityName][0],
            CITIES[groupName][cityName][1],
            index
        );
      })
    }).flat()
  ).finally(async () => {
    const pool = mysql.createPool(DB_CONFIG);
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const todayString = `${now.getFullYear()}-${month}-${date}`;

    let averageNow = allValues.reduce((memo, value) => {
      memo += value;
      return memo;
    }, 0) / allValues.length;

    // Query all history from DB
    const historyData = await new Promise((resolve, reject) => {
      pool.query(`SELECT * FROM weather ORDER BY date ASC`, (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(result);
      });
    });

    const weatherHistory = historyData.map(item => {
      const result = {};
      result[item.date] = Number(item.value);

      return result;
    })

    let todayInHistory = weatherHistory.find(item => todayString in item);

    if (todayInHistory) {
      averageNow = (averageNow + todayInHistory[todayString]) / 2;
      todayInHistory[todayString] = averageNow;

      // Update data in DB
      await new Promise(resolve => {
        pool.query(`UPDATE weather SET value = ? WHERE date = ?`, [averageNow, todayString], (err, inserted) => {
          if (err) {
            console.error(err);
          }
          resolve(inserted)
        });
      });

    } else {
      todayInHistory = {};
      todayInHistory[todayString] = averageNow
      weatherHistory.push(todayInHistory);

      // Insert new data to DB
      await new Promise(resolve => {
        pool.query(`INSERT INTO weather (date, value) VALUES (?,?)`, [todayString, averageNow], (err, inserted) => {
          if (err) {
            console.error(err);
          }
          resolve(inserted)
        });
      });
    }

    labels.average = weatherHistory.map(item => Object.keys(item)[0]);
    values.average = weatherHistory.map(item => Object.values(item)[0]);

    res.json({
      labels,
      values
    });
  });
});
