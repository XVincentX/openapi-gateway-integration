const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const baseURL = process.env.URL;
const spec = yaml.safeLoad(fs.readFileSync('./sl/petstore.oas2.yml'));
const paths = spec.paths;

Object.keys(paths).forEach(path => {
  let sec = []
  const url = `admin/pipelines${path}`;

  Object.keys(paths[path]).forEach(verb => {

    if (paths[path][verb].security) {
      paths[path][verb].security.forEach(security => {
        console.log(`Security configuration found for ${path} — ${JSON.stringify(security)}`)

        sec[0] = {};
        Object.keys(security).forEach(secKey => {
          sec[0][secKey] = {};
        })
      })
    }

    axios.put(url, {
      apiEndpoints: ['pets'],
      policies: [
        ...sec,
        {
          proxy: [
            {
              action: {
                serviceEndpoint: 'backend'
              }
            }
          ]
        }
      ]
    }, {
        baseURL,
      }).then(() => console.log("Done " + url)).catch(e => console.error(e));
  });
});
