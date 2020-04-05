const express = require("express");
const app = express();
const mongoose = require("mongoose");

const matches_names = require("./matches_names");

const Match = mongoose.model("match", require("./Match"), "matches");

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/csgomatches', {useNewUrlParser: true, useUnifiedTopology: true});

app.listen(PORT, () => {
    console.log("Listening to " + PORT);
});

app.get("/matches", async (req, res) => {
    const map = req.query.m || false;
    const player = req.query.p || false;

    let query = {};

    if(player) query["players"] = player;
    if(map) query["map"] = map;

    let data = await Match.find().or(query);
    res.send(data);
});

app.get("/matches2", async (req, res) => {
    const map = req.query.m || false;
    const player = req.query.p || false;

    let query = {};

    if(player) query["players"] = player;
    if(map) query["map"] = map;

    let data = await Match.find().or(query);
    
    res.send(getQueryStats(data));
});

app.get("/mvps", async (req, res) => {
    const map = req.query.m || false;
    const player = req.query.p || false;

    let query = {};

    if(player) query["players.0"] = player;
    if(map) query["map"] = map;
    let data = await Match.find(query);
    if(!player && !map)
        data = getMvps(data); 
    res.send(data);
});

const getMvps = (data) => {
    let mvps = {
        "Esteve": 0,    
        "Raul": 0,    
        "Didac": 0,    
        "Escopetilla": 0,
        "": 0
    };

    data.forEach(it => {
        mvps[it.players[0]]++;
    });

    return mvps;
}

const getQueryStats = (data) => {
    let res = {
        data: data,
        total: data.length,

        wins: 0,
        draws: 0,
        losses: 0,

        mvps: {
            "Esteve": 0,    
            "Raul": 0,    
            "Didac": 0,    
            "Escopetilla": 0,
            "": 0
        },
    };

    data.forEach(it => {
        if(it.result == 1) {
            res.wins++;
        } else if(it.result == 0) {
            res.draws++;
        } else if(it.result == -1) {
            res.losses++;
        }

        res.mvps[it.players[0]]++;
    });

    return res;
}
