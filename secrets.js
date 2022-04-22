const secrets = {
  dbUri: 'mongodb+srv://dev:zLX06YwhGruvrN8h@anvtangertevekutyun.ff5gu.mongodb.net/db?retryWrites=true&w=majority',
  mail: 'anvtangertevekutyunmailer@gmail.com',
  mailPass: 'AE515511',
};

const getSecret = (key) => secrets[key];

module.exports = { getSecret };
