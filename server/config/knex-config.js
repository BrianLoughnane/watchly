// var knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     user: 'root',
//     host: '127.0.0.1',
//     password: 'brian',
//     database: 'watchly',
//     charset: 'utf8'
//   }
// });

// module.exports = knex;


var knex = require('knex')({
  client: 'mysql',
  connection: {
    user: 'root',
    host: 'aa1ps36pdq3fpj9.cbacktbuwtbb.us-west-2.rds.amazonaws.com',
    password: 'fk48s3kf2mk4of93',
    database: 'ebdb',
    charset: 'utf8'
  }
});

module.exports = knex;
