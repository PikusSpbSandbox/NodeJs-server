import https from 'https';

const RETRY_COUNT = 5;

export default class Http {
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
      await new Promise(resolve => {
        setTimeout(() => resolve(true), 800);
      });
      return this.retry(fn, (retries - 1), err);
    });
  }

  makeRequest(url, retryCount = RETRY_COUNT) {
    return this.retry(() => this.request(url), retryCount);
  }
}