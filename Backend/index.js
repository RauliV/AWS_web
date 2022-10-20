import express from 'express'
import { templateData } from './github.js'
import fetch from 'node-fetch'

const app = express()
const port = 8080
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Good day, Sir!');
})

app.get('/api/list', async (req, res) => {
  let json_response = await templateData();
  res.status(json_response.status)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(json_response);
})

app.post('/api/build', async (req, res) => {
  const json = req.body;
  const packageName = json.package;
  const packageParams = json.parameters;
  //url for triggering action
  let gitUrl = "https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/github-actions-aws-cdk-deploy.yml/dispatches";
  /*
  options = {
    method: "post",
    headers: {},
    ref: packageName,
    inputs: {
       AWS_ACCESS_KEY_ID: "",
       AWS_SECRET_ACCESS_KEY: "",
       AWS_REGION: ""
    }
  }
  let response = await fetch(gitUrl, options); 
  */

  res.status(200)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json("(PLACEHOLDER) Building " + packageName);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app;