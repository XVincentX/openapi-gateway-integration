const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const baseURL = process.env.URL;
const spec = yaml.safeLoad(fs.readFileSync('./sl/petstore.oas2.yml'));

const transform = (s) => {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

const main = async () => {

  const definitions = spec.definitions;

  Object.keys(definitions).forEach(async definition => {
    console.log(`Processing ${definition}`);

    const url = `admin/pipelines/create${transform(definition)}`;

    return axios.put(url, {
      apiEndpoints: [`create${transform(definition)}`],
      policies: [
        {
          cors: {},
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
        }, {
          terminate: [
            {
              action: {
                statusCode: 422
              }
            }
          ]
        }
      ]
    }, {
        baseURL,
      }).then(() => console.log("Done " + url)).catch(e => { console.error(e); process.exit(1) });
  });

}

main();
