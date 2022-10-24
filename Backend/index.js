import express from 'express';
import { addLogLine } from './log.js';
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Good day, Sir!');
})

app.get('/api/list', (req, res) => {
  let json_response = JSON.parse('{"packages":[{"name":"package1", "description": "This is package 1"},'+
  '{"name":"package2", "description": "This is package 2"}]}');
  res.status(200)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(json_response);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//Function to test calling function data
/*async function callAddLogLine(){
  for (let i = 0; i < 220;i++){
    await addLogLine('userId', 'myDescribtion ' + i);
  }
}
await callAddLogLine();*/

export default app;