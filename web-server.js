const express = require('express');
const https = require('https');
const cors = require('cors');
const mysql = require("mysql2");

const port = 8181;
const retryCount = 5;

const DB_CONFIG = Object.freeze({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: "usersdb2",
  password: "123456"
});

class WebServer {
  retried = 0;
  queryApiUrl = 'http://';

  request(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            let json = JSON.parse(body);
            resolve(json);
          } catch (error) {
            reject(error);
          }
        });

      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  retry(fn, retries, err= null) {
    if (!retries) {
      return Promise.resolve(err);
    }
    return fn().catch(async (err) => {
      this.retried++;
      await new Promise(resolve => {
        setTimeout(() => resolve(true), 800);
      });
      return this.retry(fn, (retries - 1), err);
    });
  }
  makeRequest() {
    this.retried = 0;
    return this.retry(() => this.request(this.queryApiUrl), retryCount);
  }

  async handleRequest(data = []) {
    const pool = mysql.createPool(DB_CONFIG);
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const todayString = `${now.getFullYear()}.${month}.${date}`;

    // Query history from DB
    const historyData = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM history', (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(result);
      });
    });

    /* `historyData` handling logic here */
    /* ...  */
    /* eo `historyData` handling logic here */

    // Insert new data to DB
    await new Promise((resolve, reject) => {
      pool.query("INSERT INTO history (date, value) VALUES (?,?)", [todayString, `data.value`], (err, inserted) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(inserted)
      });
    });

    return historyData;
  }
}

const myServer = new WebServer();
const expressApp = express();

expressApp.use(cors()); // allow cross-origin requests for PHP proxy to run properly
expressApp.listen(port, () => {
  console.log(`Web server is listening on port ${port}`);
});
expressApp.get('/', (req, res) => {
  myServer.makeRequest().then(response => myServer.handleRequest(response)).then(data => {
    res.json(data);
  });
});
