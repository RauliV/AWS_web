const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.send('Good day, Sir!')
})

app.get('/list', (req, res) => {
  let json_response = JSON.parse('{"packages":[{"name":"package1", "description": "This is package 1"},'+
  '{"name":"package2", "description": "This is package 2"}]}');

  res.json(json_response);

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})