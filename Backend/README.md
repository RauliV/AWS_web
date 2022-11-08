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

# Run backend unit tests
```
npm test
```

If you get Uncaught Error: listen EADDRINUSE: address already in use :::8080
```
C:\Windows\System32>taskkill /F /IM node.exe
```

# Check backend unit test coverage
```
npm run coverage
```

# Code quality
There is static code analysis (ESLint) implemented as part of the review pipeline. The analysis contains eslint:recommended configuraition (https://eslint.org/docs/latest/rules/).

The results can be found from the pull reguest checks.