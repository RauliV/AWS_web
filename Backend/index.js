import express from 'express';
import dotenv from "dotenv"
import { addLogLine } from './log.js';
import { gitFactory } from './github.js'
import 'node-fetch'
import fetch from 'node-fetch';

if (!process.env.AWS_GIT_TOKEN) {
  dotenv.config()
  console.log("Dotenv config done")
}

const token = process.env.AWS_GIT_TOKEN

//url for triggering action
const gitBuildUrl = "https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/github-actions-aws-cdk-deploy.yml/dispatches";
const mockBuildUrl = "https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/workflows/mock-deploy.yml/dispatches";

const app = express()
const port = 8080
app.use(express.json());

app.get('/', (req, res) => {
  addLogLine("Sir", "Good day");
  res.send('Good day, Sir!');
})

app.get('/api/list', async (req, res) => {
  let json_response = await gitFactory.templateData();
  res.status(json_response.status)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(json_response);
})

async function triggerBuild(buildUrl, options) {
  let response = await fetch(buildUrl, options)
  console.log(response);
  return response
}

async function getStatus(){
  // url and query string for getting workflow runs
  let timeStamp = new Date().toISOString().substring(0,10);
  let queryString = "?created=" + timeStamp;
  const getWorkFlowsUrl = "https://api.github.com/repos/PROJ-A2022-G06-AWS-2-Cloud-Organization/PROJ-A2022-G06-AWS-2-Cloud/actions/runs"+queryString;

  console.log("This is status log");
  const workflowRunHeaders = {"Accept" : "application/vnd.github+json", "Authorization" : "Bearer " + token};
  await new Promise(resolve => setTimeout(resolve, 5000));
  let workflowRuns = await fetch(getWorkFlowsUrl, {headers: workflowRunHeaders});
  let jsonData = await workflowRuns.json();
  let jobs_url = jsonData.workflow_runs[0].jobs_url;
  while(true){  
      let jobs = await fetch(jobs_url, {headers: workflowRunHeaders});
      let jobsData = await jobs.json();
      let status = jobsData.jobs[0].status;
      console.log("Current status is: " + status);
      if(status === 'completed'){
        break;
      }
      else{
        console.log("Lets wait for 5 seconds")
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
  }
}

app.post('/api/build', async (req, res) => {
  const json = req.body;
  const packageName = json.package;
  const packageParams = json.parameters;

  let options = {
    method: "post",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      ref: "main",
      inputs: packageParams
    })
  }
  
  //let response = await indexFactory.triggerBuild(options); 
  let response = await indexFactory.triggerBuild(mockBuildUrl, options);

  if (response.status == 204) {
    res.status(200)
  } else {
    res.status(response.status)
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json("(PLACEHOLDER) Building " + packageName + " - Status: " + response.status);
  //get status
  //timeout because action is in queue for couple seconds
  //if we get status before action is in process, we get the data from previous workflow run
  getStatus();
    
  });


  
  //let run_id = JSON.parse(workflowRuns).workflow_runs[0].id;
  //console.log(run_id);
  


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app;

export const indexFactory = {
  triggerBuild
}