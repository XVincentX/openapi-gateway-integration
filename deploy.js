const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const queue = require('async/queue');

const baseURL = process.env.URL;
const spec = yaml.safeLoad(fs.readFileSync('./sl/petstore.oas2.yml'));

const transform = (s) => {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

const main = () => {

  const definitions = spec.definitions;
  let security;

  if (spec.security) {
    security =
      spec.securityDefinitions[Object.keys(spec.security[0])[0]]
  }

  const q = queue(definition, callback => {
    {
      console.log(`Processing ${definition}`);

      const url = `admin/pipelines/create${transform(definition)}`;

      const payload = {
        apiEndpoints: [`create${transform(definition)}`],
        policies: [
          {
            cors: {}
          },
          {
            jwt: security && security.type === 'oauth2' ? [
              {
                action: {
                  checkCredentialExistence: false,
                  secretOrPublicKeyFile: "/app/config/cert.pem",
                  audience: "https://api.apitest.lan"
                }
              }
            ]
              : undefined,
          },
          {
            proxy: [
              {
                action: {
                  serviceEndpoint: 'backend'
                },
                condition: {
                  name: "json-schema",
                  logErrors: true,
                  schema: definitions[definition]
                }
              }
            ]
          },
          {
            terminate: [
              {
                action: {
                  statusCode: 422
                }
              }
            ]
          }
        ]
      }

      return axios.put(url, payload, {
        baseURL,
      }).then(() => console.log("Done " + url)).catch(e => { console.error(e); process.exit(1) });
    }
  })

  Object.keys(definitions).forEach(q.push(definition));

  q.drain = function () {
    console.log("Finish!");
  }

  q.error = function (e) {
    console.error(e);
  }

}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
