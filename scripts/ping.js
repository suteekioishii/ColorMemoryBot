// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
'use strict';

const moment = require('moment');
//テスト用のデータ
var testDB =[
  {user:"eggGirl", message:"初めて片手で卵を割ることができ、エッグマスターになった！"},
  {user:"coffeeBoy", message:"コーヒーだけを飲み過ぎると尿路結石ができるらしい…。適度に水を飲もうね。"},
  {user:"忍者U", message:"水遁の術とは水中に身を隠す術だ！都会の生活排水で汚れ切った川の中に飛び込むのは並大抵の気持ちでは無理だ。"},
  {user:"_0x0_", message:"タンバリンがあるカラオケってもうないの？？"},
  {user:"起床endless", message:"今日は良い天気だったので散歩をした。美味しいクッキー屋さんを見つけた。"}
];

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

//testデータ追加用
for (const e of testDB) {
  sequelize.sync({ force: false, alter: true })
  .then(addMessage(e["user"],e["message"]))
  .catch((mes) => {
    console.log("db connection error", mes);
  });
  console.log(e);
}

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


// ランダムにメッセージを取得する関数
function getRandomMessage(res,user) {
  MessagesDB.findAll({
    where: {
      username: {
        [Sequelize.Op.ne]: user
      }
    },
    order: sequelize.random(),
    limit: 1
  })
.then((message) => {
  if (message) {
    res.send("メッセージが流れ着きました");
    message = message[0];
    var Date = moment(message.createdAt).format('M月 D日 H:mm:ss');
    //バッククォートで変数の置換。ダブルクオーテーションではだめ。
    res.send(`投稿者 ${message.username}\n投稿日時 ${Date}\n\n ${message.message}`);
    return message.destroy();
  } else {
    res.send("No messages found in the database.");
  }
})
.catch((err) => {
  console.log("db fetch error", err);
  res.send("Error fetching message from the database.");
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
      if(arrayM.length ==2){
        let user  = arrayM[0];
        let message = arrayM[1];
        res.send("メッセージを投げ入れました。");
        sequelize.sync({ force: false, alter: true })
        .then(() => {
          getRandomMessage(res,user);
        })
        .then(addMessage(user,message))
        .catch((mes) => {
          console.log("db connection error", mes);
        });
      }else{
        res.send("throwは以下のフォーマットのみ対応しています。\n\n投稿者名\n本文");
      };nn
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




  
