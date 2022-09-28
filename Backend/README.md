# Run backend locally
```
npm init
npm install express --save
node index.js
```

# Run with docker
```
docker build -t node-app .
docker run -d -p 80:3000 node-app
```

Now the backend should be reachable in http://localhost