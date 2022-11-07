import express from 'express';
import dotenv from 'dotenv';
import { addLogLine } from './log.js';
import { gitFactory } from './github.js';
import 'node-fetch';
import fetch from 'node-fetch';

if (!process.env.AWS_GIT_TOKEN) {
  dotenv.config();
  console.log('Dotenv config done');
}

const token = process.env.AWS_GIT_TOKEN;

//url for triggering action
//const gitBuildUrl = 'https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/github-actions-aws-cdk-deploy.yml/dispatches';
const mockBuildUrl = 'https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/mock-deploy.yml/dispatches';

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

async function triggerBuild(buildUrl, options) {
  const response = await fetch(buildUrl, options);
  console.log(response);
  return response;
}

app.get('api/status', async(req, res) =>{
  let state = await getStatus();
  res.status(200);
  res.json(`State: ${ state }`);
})

// NOTE: I would call this in the api/status query comming from front insted of api/built query.
// buid query gets to return and status query is waiting for next new state.
async function getStatus(){
  // url and query string for getting workflow runs
  const timeStamp = new Date().toISOString().substring(0, 10);
  const queryString = `?created=${timeStamp}`;
  const getWorkFlowsUrl = `https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/runs${queryString}`;

  console.log('This is status log');
  const workflowRunHeaders = {'Accept' : 'application/vnd.github+json', 'Authorization' : `Bearer ${ token}`};
  
  const workflowRuns = await fetch(getWorkFlowsUrl, {headers: workflowRunHeaders});
  const jsonData = await workflowRuns.json();
  const jobs_url = jsonData.workflow_runs[0].jobs_url;
  const jobs = await fetch(jobs_url, {headers: workflowRunHeaders});
  const jobsData = await jobs.json();
  console.log(jobsData);
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
      ref: 'main',
      inputs: packageParams
    })
  };
  //let response = await indexFactory.triggerBuild(options); 
  const response = await indexFactory.triggerBuild(mockBuildUrl, options);

  if (response.status === 204) {
    res.status(200);

  res.json(`(PLACEHOLDER) Building ${packageName} - Status: ${response.status}`);
  //get status
  //timeout because action is in queue for couple seconds
  //if we get status before action is in process, we get the data from previous workflow run
  getStatus();
    
  }
});


  
  //let run_id = JSON.parse(workflowRuns).workflow_runs[0].id;
  //console.log(run_id);

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
    res.status(200);
  } else {
      res.status(404);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json('Data: no-data');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;

export const indexFactory = {
  triggerBuild
};