import mysql from "mysql2";
import HttpUtils from "../http-utils";

import { DB_CONFIG } from '../../db-config';
import {
    CITIES,
    weatherLabels,
    weatherValues
} from "./definitions";

export default class WeatherApp {
    http = new HttpUtils();
    labels = {};
    values = {};
    allValues = [];

    requestWeather(groupName, latitude, longitude, index) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        return this.http.makeRequest(url).then(response => {
                this.allValues.push(this.values[groupName][index] = Number(response.current_weather.temperature));
            })
            .catch(err => console.error(err));
    }

    async processData() {
        const pool = mysql.createPool(DB_CONFIG);
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const todayString = `${now.getFullYear()}-${month}-${date}`;

        let averageNow = this.allValues.reduce((memo, value) => {
            memo += value;
            return memo;
        }, 0) / this.allValues.length;

        // Query all history from DB
        const historyData = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM weather ORDER BY date ASC', (err, result) => {
                if (err) {
                    console.error(err);
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
                pool.query('UPDATE weather SET value = ? WHERE date = ?', [averageNow, todayString], (err, inserted) => {
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
                pool.query('INSERT INTO weather (date, value) VALUES (?, ?)', [todayString, averageNow], (err, inserted) => {
                    if (err) {
                        console.error(err);
                    }
                    resolve(inserted)
                });
            });
        }

        this.labels.average = weatherHistory.map(item => Object.keys(item)[0]);
        this.values.average = weatherHistory.map(item => Object.values(item)[0]);

        return {
            labels: this.labels,
            values: this.values
        };
    }

    handleRequest() {
        this.labels = {...weatherLabels};
        this.values = {...weatherValues};
        this.allValues = [];

        return Promise.all(
            Object.keys(CITIES).map(groupName => {
                return Object.keys(CITIES[groupName]).map((cityName, index) => {
                    return this.requestWeather(
                        groupName,
                        CITIES[groupName][cityName][0],
                        CITIES[groupName][cityName][1],
                        index
                    );
                })
            }).flat()
        )
        .then(() => this.processData())
        .catch(() => this.processData());
    }
}