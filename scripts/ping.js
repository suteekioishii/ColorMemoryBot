// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
'use strict';

//データベース用の記述
const Sequelize = require('sequelize');
let DB_INFO = "postgres://colormemory:myPostgres@localhost:5432/colormemory";
let pg_option = {};

if (process.env.DATABASE_URL) {
  DB_INFO = process.env.DATABASE_URL;
  pg_option = { ssl: { rejectUnauthorized: false } };
}

const sequelize = new Sequelize(DB_INFO,
  {
    dialect: 'postgres',
    dialectOptions: pg_option
  });

  const MessagesDB = sequelize.define('messages',
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: Sequelize.TEXT,
      message: Sequelize.TEXT
    },
    {
      // timestamps: false,      // disable the default timestamps
      freezeTableName: true   // stick to the table name we defined
    });
function addMessage(user,message) {
  console.log("db connection succeeded");
  let newMessage = new MessagesDB(
    {
      username: user,
      message: message
    }
    
  );

  newMessage.save()
    .then((mes) => {
      console.log(mes.dataValues);
    })
    .catch((err) => {
      console.log("db save error", err);
    });
  }


///////////以下からchatbot
module.exports = (robot) => {
  robot.respond(/PING$/i, (res) => {
      res.send('PONG');

      
      sequelize.sync({ force: false, alter: true })
      .then(addMessage)
      .catch((mes) => {
        console.log("db connection error", mes);
      });
      

      
  });
  
  robot.respond(/throw([\s\S])([\s\S]*)/i, (res) => {
      let arrayM = res.match[2].split(/\n/);
      let user  = arrayM[0];
      let message = arrayM[1];
      res.send(arrayM[0]);
      res.send("a");
      sequelize.sync({ force: false, alter: true })
      .then(addMessage(user,message))
      .catch((mes) => {
        console.log("db connection error", mes);
  });
      

      
  });

  robot.respond(/ADAPTER$/i, (res) => {
    res.send(robot.adapterName);
  });

  robot.respond(/ECHO (.*)$/i, (res) => {
    res.send(res.match[0]);
  });

  robot.respond(/TIME$/i, (res) => {
    res.send(`Server time is: ${new Date()}`);
  });
};




  
