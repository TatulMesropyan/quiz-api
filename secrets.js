const secrets = {
  dbUri: 'mongodb+srv://dev:zLX06YwhGruvrN8h@anvtangertevekutyun.ff5gu.mongodb.net/db?retryWrites=true&w=majority',
  mail: 'armenrub1991@mail.ru',
  mailPass: 'armkis088300',
};

const getSecret = (key) => secrets[key];

module.exports = { getSecret };
