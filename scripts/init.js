const fs = require('fs');
const readline = require('readline');
const Canvas = require('canvas-lms-api');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}

var data = {
    url: {
        data: null,
        message: 'Please enter your canvas url or district name (https://_.instructure.com/): ',
    },
    token: {
        data: null,
        message: 'Please enter your canvas API token: ',
    },
    oncomplete: function () {
        this.token.data = this.token.data.replace(' ', '');
        this.url.data = isValidHttpUrl(this.url.data) ? this.url.data : `https://${this.url.data}.instructure.com/`;
        const client = new Canvas(this.url.data, {
            accessToken: this.token.data.replace(' ', ''),
        });
        client
            .get('users/self', () => true)
            .then((value) => {
                process.stdout.write(`Token verified!\n`);
                let contents = `TOKEN="${this.token.data}"\nCANVAS_URL="${this.url.data}"`;
                fs.writeFileSync('.env', contents);
                rl.close();
            })
            .catch((error) => {
                process.stdout.write('Invalid API Token or url!\n\n');
                n = 0;
                key = keys[n++];
                message = data[key].message;
                process.stdout.write(message);
            });
    },
};

let keys = Object.keys(data);
let n = 0;
let key = keys[n++];
let message = data[key].message;
process.stdout.write(message);

rl.on('line', (line) => {
    data[key].data = line;
    if (n === keys.length - 1) {
        data.oncomplete();
        return;
    }
    key = keys[n++];
    message = data[key].message;
    process.stdout.write(message);
});
