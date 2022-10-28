import { promises as fs } from "fs";
import callerId from 'caller-id';

/**
 * This function adds a log line to a logFile. If directory or file doesn't exsist,
 * it will create them first with a header. Line has also information on a function
 * and line where this function is called, timestamp and running line numbers. To
 * avoid too big files, number of the lines is restricted to maxLineNumbers.
 * @param {*} userId Current logged in user. If parameter is not given, use '-'
 * @param {*} description Description of the logged action. If parameter is not given, use '-'
 */

export async function addLogLine(userId =' -', description = '-'){

    const logFile = '../logs/actionlog.txt';
    const logDir = '../logs';
    let content = '';
    const maxLineNumbers = 200;
    let nextLineNumber = 0;
    const header = 'LINE\tDATE AND TIME OF THE ACTION\tUSERID\t\tCALLER FUNCTION\t\tDESCRIPTION\n';
    
    try {
      content = await fs.readFile(logFile);  
    } catch(err) {      
      if (err.code == 'ENOENT'){ //File not found
        try {
          fs.mkdir(logDir); //making directory if it doesn't exsist        
          await fs.appendFile(logFile, header); //Create a new logfile
          await addLogLine('System', 'No logfile yet, creating one.'); //Logging creating new file
          console.log(`File: ${ logFile } not found. I will create one for you`);
          nextLineNumber++;
        } 
        catch (errCreating){
          console.error(errCreating);
        }
      }
    }
  
    userId = userId.substring(0, 8).padEnd(8);
    const caller = callerId.getData(addLogLine);
    const lineNumber = caller.lineNumber;
    const callerFunction = `${caller.functionName.substring(0, 15).padEnd(15) }(${ lineNumber })`;
    const timeStamp = new Date().toUTCString();
    const lines = content.toString().split('\n');
    if (lines.length > 2) {     
      const lastLine = lines[lines.length-1]; 
      nextLineNumber = (Number(lastLine.split('\t')[0])) + 1;    
    }
    const newLog = `${nextLineNumber }\t${ timeStamp }\t${ userId  
    }\t${ callerFunction }\t${ description}`;

    if (lines.length > maxLineNumbers){
      lines.push(newLog); //Add new line
      lines.splice(0, 3); //Remove first header and first line
      
      await fs.unlink(logFile);
      const newLines = [];
      newLines.push(header);
      lines.forEach(element => {
        newLines.push(`\n${ element}`); 
      });
      await fs.appendFile(logFile, newLines, function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
    else {
      lines.push(`/n${ newLog}`);
      await fs.appendFile(logFile, `\n${ newLog}`, function(error) {
        if (error) {
          console.log(error);
        }
      });  
    }
    
  }