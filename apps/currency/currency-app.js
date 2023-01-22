import mysql from "mysql2";
import HttpUtils from "../http-utils";

import { DB_CONFIG } from '../../db-config';
import { currencyValues, currencyLabels } from "./definitions";

const CURRENCY_API_URL = 'https://www.cbr-xml-daily.ru/latest.js';

export default class CurrencyApp {
    http = new HttpUtils();
    labels = {};
    values = {};
    usdRate = null;
    eurRate = null;


    requestCurrency() {
        return this.http.makeRequest(CURRENCY_API_URL).then(data => {
            const eurRate = 1 / data.rates.EUR;
            const usdRate = 1 / data.rates.USD;
            return {eurRate, usdRate};
        }).catch(err => console.error(err));
   }

    async processData(data = {eurRate: null, usdRate: null}) {
        const pool = mysql.createPool(DB_CONFIG);
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const todayString = `${now.getFullYear()}-${month}-${date}`;

        // Query all history from DB
        const historyData = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM currency ORDER BY date ASC', (err, result) => {
                if (err) {
                    console.error(err);
                }
                resolve(result);
            });
        });

        let todayInHistory = historyData.find(item => item.date === todayString);

        if (todayInHistory) {
            // In case API doesn't work
            if (data.usdRate === null) {
                data.usdRate = todayInHistory.usdRate;
            }
            if (data.eurRate === null) {
                data.eurRate = todayInHistory.eurRate;
            }

            todayInHistory.usdRate = data.usdRate;
            todayInHistory.eurRate = data.eurRate;

            // Update data in DB
            await new Promise(resolve => {
                pool.query(
                    'UPDATE currency SET usd = ?, eur = ? WHERE date = ?',
                    [data.usdRate, data.eurRate, todayString],
                    (err, inserted) => {
                        if (err) {
                            console.error(err);
                        }
                        resolve(inserted)
                    }
                );
            });
        } else if (data.eurRate !== null && data.usdRate !== null) {
            todayInHistory = {
                date: todayString,
                usdRate: data.usdRate,
                eurRate: data.eurRate
            };
            historyData.push(todayInHistory);

            // Insert new data to DB
            await new Promise(resolve => {
                pool.query(
                    'INSERT INTO currency (date, usd, eur) VALUES (?, ?, ?)',
                    [todayString, data.usdRate, data.eurRate],
                    (err, inserted) => {
                        if (err) {
                            console.error(err);
                        }
                        resolve(inserted)
                    }
                );
            });
        }

        this.eurRate = data.eurRate;
        this.usdRate = data.usdRate;

        this.labels.eur = this.labels.usd = historyData.map(item => item.date);
        this.values.usd = historyData.map(item => item.usd);
        this.values.eur = historyData.map(item => item.eur);

        return {
            eurRate: this.eurRate,
            usdRate: this.usdRate,
            labels: this.labels,
            values: this.values
        };
    }

    handleRequest() {
        this.labels = {...currencyLabels};
        this.values = {...currencyValues};

        return this.requestCurrency()
            .then(data => this.processData(data))
            .catch(() => this.processData());
    }
}