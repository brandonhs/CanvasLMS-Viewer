const Canvas = require('canvas-lms-api');
const express = require('express');
require('dotenv').config();

const app = express();

var data = {};
var lastUpdate = new Date().getTime();
var maxUpdate = 10000;

if (!process.env.CANVAS_URL || !process.env.TOKEN) {
    console.log('Canvas not configured! (run npm install or npm run configure)');
    process.exit(-1);
}
const client = new Canvas(process.env.CANVAS_URL, {
    accessToken: process.env.TOKEN,
});

app.use(express.static('public'));

app.get('/user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    client
        .get('users/self', () => true)
        .then((value) => {
            res.send(value);
        })
        .catch((error) => {
            console.log(error);
            res.status(503).send(error);
        });
});

app.get('/todo', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

app.get('/announcements', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    client
        .get('courses/', () => true)
        .then((courses) => {
            client
                .get('announcements', () => true, {})
                .then((value) => {
                    res.send(value);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(503).send(error);
                });
        })
        .catch((error) => {
            console.log(error);
            res.status(503).send(error);
        });
});

const update = () => {
    console.log('Updating Data.');
    client
        .get('users/self/todo', () => true)
        .then((value) => {
            value.sort((a, b) => {
                return b.course_id - a.course_id;
            });
            client
                .get('courses/', () => true)
                .then((v2) => {
                    for (let v in value) {
                        value[v].course_name = v2.filter(function (d) {
                            return d.id == value[v].course_id;
                        })[0].name;
                    }
                    setTimeout(update, maxUpdate);
                    console.log('Data Updated.');
                    data = value;
                });
        })
        .catch((error) => {
            console.log(error);
        });
};

app.listen(5000, () => {
    console.log('Listening');
    update();
});
