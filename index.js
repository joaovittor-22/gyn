const express = require('express')
const app = express()
const { Pool } = require('pg');
const http = require("http");
const server = new http.Server(app);
const path = require('path');
const fs = require('fs')
const multer  = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'assets/')
    },
    filename: function (req, file, cb) {
        var id =  Date.now().toString().slice(5,12) 
      cb(null,id+"_"+file.originalname) 
    }
  })
  

const upload = multer({ storage: storage })


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

pool.query(`CREATE TABLE IF NOT EXISTS places (ID SERIAL PRIMARY KEY, name TEXT NOT NULL, image TEXT);`, function(err, resQuery) {
        if(err) {
             console.error('error running query', err);
        }
        else { }
    });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/web/index.html'));
})

app.get('/api/comments/read/:id_place?', (req, res) => {
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

app.post('/api/comments/add', (req, res) => {
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

app.post('/api/places/add', upload.single('image'), (req, res) => {
    var name = req.body?.name_place;
    var image = req.file?.filename;

    const textSQL = 'INSERT INTO places(name,image) VALUES($1,$2) RETURNING *'
    const values = [name, image]
    try {
     pool.query(textSQL, values, function(err, resQuery) {
        if(err) {
          const textSQLUpdate = 'DROP TABLE places'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             console.error('error running query', err);
             res.sendStatus(500)
        }
        else {
             res.send({result:"novo local adicionado"})
        }
    });  
    }catch(e){
     //tratativa de erros
    }
})

app.put('/api/places/update/:id', upload.single('image'), (req, res) => {
    var name = req.body?.name_place;
    var image = req.file?.filename;
    var id = req.params.id;

    const textSQL = 'UPDATE places SET name = $1, image = COALESCE($2,image)  WHERE id = $3'
    const values = [name, image, id]
    try {
     pool.query(textSQL, values, function(err, resQuery) {
        if(err) {
          const textSQLUpdate = 'DROP TABLE places'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             console.error('error running query', err);
             res.sendStatus(500)
        }
        else {
             res.sendStatus(200)
        }
    });
    }catch(e){
     //tratativa de erros
    }
})
app.get('/api/places/list', (req, res) => {
    const textSQL = 'SELECT * FROM places'
    try {
     pool.query(textSQL, function(err, resQuery) {
        if(err) {
            const textSQLUpdate = 'DROP TABLE places'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             res.sendStatus(500)
        }
        else {
             res.send(resQuery.rows)
        }
    });
    }catch(e){
     //tratativa de erros
    }
})

app.get('/api/places/data/:id_place', (req, res) => {
    const id_place = req.params.id_place;
    const textSQL = 'SELECT * FROM places WHERE ID = $1'
    const values = [id_place]

    try {
     pool.query(textSQL, values, function(err, resQuery) {
        if(err) {
            const textSQLUpdate = 'DROP TABLE places'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             res.sendStatus(500)
        }
        else {
             res.send(resQuery.rows[0] ?? null)
        }
    });
    }catch(e){
     //tratativa de erros
    }
})

app.delete('/api/places/delete/:id_place', (req, res) => {
    var id_place = req.params?.id_place;
    const textSQL = 'DELETE FROM places WHERE ID = $1'
    const values = [id_place]
    try {
     pool.query(textSQL, values, function(err, resQuery) {
        if(err) {
            const textSQLUpdate = 'DROP TABLE places'
            pool.query(textSQLUpdate, function(err, resQuery) {
            })
             console.error('error running query', err);
             res.sendStatus(500)
        }
        else {
         res.send({result:"Deletado com sucesso"})
        }
    });
    }catch(e){
     //tratativa de erros
    }
})

app.get('/api/midia/:name_midia', (req, res) => {
    const name_midia = req.params.name_midia;
    const path = __dirname+"/assets/"+name_midia
    try {    
        res.sendFile(path)
    }catch(e){
     //tratativa de erros
     console.log(e)
     res.send(500);
    }
})

app.get('/api/places/statistics', (req, res) => {
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
  