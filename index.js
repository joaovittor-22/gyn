const express = require('express')
const app = express()
const { Pool } = require('pg');
const http = require("http");
const server = new http.Server(app);
const path = require('path');

require('dotenv').config()

//app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/web'));
const io = require('socket.io')(server, {
  maxHttpBufferSize: 5e8,
  });

var config = {
    user: process.env.USER_DB, 
    database:process.env.DATABASE, 
    password: process.env.PASSWORD, 
    host: process.env.HOST, 
    port: 5432, 
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000,
    ssl: true
};

const pool = new Pool(config);  

pool.query(`CREATE TABLE IF NOT EXISTS comments (ID SERIAL PRIMARY KEY, id_place INT NOT NULL,name TEXT, comment_text TEXT NOT NULL, note TEXT NOT NULL);`, function(err, resQuery) {
        if(err) {
             console.error('error running query', err);
        }
        else { }
    });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/web/index.html'));
})

app.get('/comments/read/:id_place?', (req, res) => {
   var id_place = req.params.id_place;
    pool.query('SELECT * FROM comments', function(err, resQuery) {
        if(err) {
             console.error('error running query', err);
             res.sendStatus(500)
        }
        else {
           var result = id_place != null ? resQuery.rows.filter(comment => comment.id_place === Number(id_place)) :resQuery.rows ;
             res.send(result)
        }
    });
})

app.post('/comments/add', (req, res) => {
    var text = req.body?.text;
    var note = req.body?.note;
    var id_place = req.body?.id_place;
    var name = req.body?.name ?? "Anônimo";

    const textSQL = 'INSERT INTO comments(id_place,name,comment_text, note) VALUES($1,$2,$3,$4) RETURNING *'
    const values = [id_place, name, text, note]
    try {
     pool.query(textSQL, values, function(err, resQuery) {
        if(err) {
            const textSQLUpdate = 'DROP TABLE comments'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             console.error('error running query', err);
             res.sendStatus(500)
        }
        else {
             res.send({result:"novo valor adicionado"})
        }
    });
    }catch(e){
     //tratativa de erros
    }
  
})

app.get('/places/statistics', (req, res) => {
    pool.query('SELECT * FROM comments', function(err, resQuery) {
        if(err) {
             console.error('error running query', err);
            res.sendStatus(500)
        }
        else {
    var comments_list = resQuery.rows;
        result = [];
        comments_list.forEach((item)=>{
            let found = result.find((element) => element.id_place == item.id_place);
           if(found == undefined){
              new_item = {id_place: item.id_place, number_comments: 1, total_notes:Number(item.note)}
               result.push(new_item);
           }else {
            found.number_comments++;
            found.total_notes = Number(item.note)+found.total_notes;
            result.splice(result.findIndex(i => i.id_place === item.id_place), 1, found);
           }
    })
    result2 = result.map((item)=>{item.average_note =(item.total_notes/item.number_comments).toPrecision(2); 
    delete item['total_notes'];
    return item;})
     res.send(result2)
        }
    });
  
})


io.on('connection', (socket) => {
    socket.on('new_post', () => {
        console.log("teste")
        socket.emit("news", "update");
     });
  });

server.listen(process.env.PORT || 3000, function() {
    console.log('App listening...')
  });
  