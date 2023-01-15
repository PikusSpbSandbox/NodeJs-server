const express = require('express');
const https = require('https');
const cors = require('cors');
const fs = require('fs');

const port = 8181;
const retryCount = 5;
const historyFile = __dirname + '/data-history.json';

class WebServer {
  retried = 0;
  url = 'http://';

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
    return this.retry(() => this.request(this.url), retryCount).then(data => this.handleRequest(data));
  }

  handleRequest(data = []) {
    const dataHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const todayString = `${now.getFullYear()}.${month}.${date}`;

    /* sever history data logic here */
    /* ...  */
    /* eo sever history data logic here */


    const content = JSON.stringify(dataHistory);

    fs.writeFile(historyFile, content, err => {
      if (err) {
        console.error(err);
      }
    });

    return dataHistory;
  }
}

const myServer = new WebServer();
const expressApp = express();

expressApp.use(cors()); // allow cross-origin requests for PHP proxy to run properly
expressApp.listen(port, () => {
  console.log(`Web server is listening on port ${port}`);
});
expressApp.get('/', (req, res) => {
  myServer.makeRequest().then(response => {
    res.json( response );
  });
});
