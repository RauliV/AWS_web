import express from 'express';
import dotenv from 'dotenv';
import { addLogLine } from './log.js';
import { gitFactory } from './github.js';
import 'node-fetch';

if (!process.env.AWS_GIT_TOKEN) {
  dotenv.config();
  console.log('Dotenv config done');
}

const token = process.env.AWS_GIT_TOKEN;

//url for triggering action
const gitBuildUrl = 'https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/github-actions-aws-cdk-deploy.yml/dispatches';

const app = express();
const port = 8080;
app.use(express.json());

app.get('/', (req, res) => {
  addLogLine('Sir', 'Good day');
  res.send('Good day, Sir!');
});

app.get('/api/list', async (req, res) => {
  const json_response = await gitFactory.templateData();
  res.status(json_response.status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(json_response);
});

async function triggerBuild(options) {
  const response = await fetch(gitBuildUrl, options);
  return response;
}

app.post('/api/build', async (req, res) => {
  const json = req.body;
  const packageName = json.package;
  const packageParams = json.parameters;

  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${ token}`
    },
    body: JSON.stringify({
      ref: packageName,
      inputs: packageParams
    })
  };
  
  const response = await indexFactory.triggerBuild(options); 
  if (response.status === 204) {
    res.status(200);
  } else {
    res.status(response.status);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(`(PLACEHOLDER) Building ${ packageName } - Status: ${ response.status}`);
});

app.post('/api/auth', async (req, res) => {
  const json = req.body;
  const username = json.username;
  
  // Dummy authentication.
  const users = [ 
    'Kosti', 
    'Onni', 
    'Miikka', 
    'Rauli', 
    'Veera', 
    'Hermanni', 
    'Linnea'
  ];

  if (users.includes(username)) {
    alert("auth ok");
    res.status(200);
  } else {
    res.status(404);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;

export const indexFactory = {
  triggerBuild
};