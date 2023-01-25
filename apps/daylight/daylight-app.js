import mysql from "mysql2";
import HttpUtils from "../http-utils";

import { DB_CONFIG } from '../../db-config';

const API_URL = 'https://api.bf5.ru/sun?lat=60.256511&lon=29.603100';

export default class DaylightApp {
    http = new HttpUtils();
    labels = {};
    values = {};

    requestDaylight() {
        return this.http.makeRequest(API_URL).catch(err => console.error(err));
   }

    async processData(data = {sunrise:  null, sunset: null}) {
        const pool = mysql.createPool(DB_CONFIG);
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const todayString = `${now.getFullYear()}-${month}-${date}`;

        // Query all history from DB
        const historyData = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM lightday ORDER BY date ASC', (err, result) => {
                if (err) {
                    console.error(err);
                }
                resolve(result);
            });
        });

        let todayInHistory = historyData.find(item => item.date === todayString);

        if (todayInHistory) {
            // In case API doesn't work
            if (data.sunrise === null) {
                data.sunrise = todayInHistory.sunrise;
            }
            if (data.sunset === null) {
                data.sunset = todayInHistory.sunset;
            }

            todayInHistory.sunrise = data.sunrise;
            todayInHistory.sunset = data.sunset;

            // Update data in DB
            await new Promise(resolve => {
                pool.query(
                    'UPDATE lightday SET sunrise = ?, sunset = ? WHERE date = ?',
                    [data.sunrise, data.sunset, todayString],
                    (err, inserted) => {
                        if (err) {
                            console.error(err);
                        }
                        resolve(inserted)
                    }
                );
            });
        } else if (data.sunrise !== null && data.sunset !== null) {
            todayInHistory = {
                date: todayString,
                sunrise: data.sunrise,
                sunset: data.sunset
            };
            historyData.push(todayInHistory);

            // Insert new data to DB
            await new Promise(resolve => {
                pool.query(
                    'INSERT INTO lightday (date, sunrise, sunset) VALUES (?, ?, ?)',
                    [todayString, data.sunrise, data.sunset],
                    (err, inserted) => {
                        if (err) {
                            console.error(err);
                        }
                        resolve(inserted)
                    }
                );
            });
        }

        this.labels = historyData.map(item => item.date);
        this.values = historyData.map(item => item.sunrise);
        this.values2 = historyData.map(item => item.sunset);

        return {
            labels: this.labels,
            values: this.values,
            values2: this.values2
        };
    }

    handleRequest() {
        this.labels = [];
        this.values = [];

        return this.requestDaylight()
            .then(data => this.processData(data))
            .catch(() => this.processData());
    }
}