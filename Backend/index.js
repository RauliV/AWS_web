import express from 'express';
const app = express();
const port = 8080;
import { promises as fs } from "fs";
import callerId from 'caller-id';



async function addLogLine(userId =' -', description = '-'){

  const logFile = './logs/actionlog.txt';
  let content = '';

  try {
    content =  await fs.readFile(logFile);  
  } catch(err) {      
    if (err.code == 'ENOENT'){  //File not found
      try {
        const header = 'LINE' + '\t' + 'DATE AND TIME OF THE ACTION\t' + '\t\t' + userId + 
        '\t\t\t' + 'CALLER FUNCTION' + '\t\t\t' + 'DESCRIPTION' + '\n';
        fs.appendFile(logFile, header);  //Create a new logfile
        await addLogLine('Mr. Bob', 'No file yet, creating one.'); //Logging creating new file
      } 
      catch (errCreating){
        console.error(errCreating);
      }
    }
  }

  userId = userId.substring(0,10).padEnd(10)
  const caller = callerId.getData(addLogLine);
  const lineNumber = caller.lineNumber;
  const callerFunction = caller.functionName.substring(0,15).padEnd(15) + '(' + lineNumber + ')';
  const timeStamp = new Date().toUTCString();
  let nextLineNumber = 0;
  const lines = content.toString().split('\n');
  if (lines.length > 2) {     
    const lastLine = lines[lines.length-1]; 
    nextLineNumber = (Number(lastLine.split('\t\t')[0])) + 1;
  }
  const newLog = '\n' + nextLineNumber + '\t\t' + timeStamp + '\t\t' + userId + 
  '\t\t' + callerFunction + '\t\t' + description;
  await fs.appendFile(logFile, newLog, function(error) {});  
  
}

//Function to test calling function data
async function callAddLogLine(){
  for (let i = 0; i < 3;i++){
    await addLogLine('userId', 'myDescribtion');
  }
}

await callAddLogLine();


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

export default app;