<script>
    const Views = {
        Login: "Login",
        Main: "Main",
        PackageSelection: "PackageSelection",
    };
    let currentView = Views.Login;

    let availablePackages = [];

    let log = "";

    console.log(availablePackages);
    console.log(typeof availablePackages);

    let selectedPackage = null;

    // The build parameters.
    let secretkey = null;
    let accesskey = null;
    let region = null;

    // Login parameters
    let username = null;
    let password = null;
    let logInFailed = false;

    function processLogin() {
        logInFailed = false;
        let loginInfo = {
            username: username, 
            password: password
        };

        const path = SERVER_CONNECTION + "://" + window.location.hostname + "/api/auth";
        const res = fetch(path, {
            method: "POST",
            body: JSON.stringify(loginInfo),
            headers: {
                "Content-Type": "application/json"
            },
        }).then((res) => { 
            if (res.status == 200) {
                logMessage("Entered main view from login screen");
                currentView = Views.Main;
                username = "";
                password = "";
            } else {
                logInFailed = true;
            }
        })
    }

    function startNewEnvironment() {
        logMessage("Starting new environment");
        const path = SERVER_CONNECTION + "://" + window.location.hostname + "/api/list";
        const response = fetch(path)
            .then((response) => response.json())
            .then((data) => {
                logMessage("Available package data fetched from backend");
                availablePackages = [];
                selectedPackage = null;
                availablePackages = Array.from(data.templates);
                currentView = Views.PackageSelection;
            })
            .catch((error) => {
                logMessage(error);
                availablePackages = [];
                selectedPackage = null;
                return [];
            });
    }

    function returnToMain() {
        logMessage("Returned to main view from package selection screen");
        availablePackages = [];
        selectedPackage = null;
        currentView = Views.Main;
            
        secretkey = null;
        accesskey = null;
        region = null;
            
    }

    async function sendBuildRequest() {
        const path = SERVER_CONNECTION + "://" + window.location.hostname + "/api/build";

        let buildParameters = {
            AWS_ACCESS_KEY_ID: accesskey,
            AWS_SECRET_ACCESS_KEY: secretkey, // We need to figure a secure way to handle this
            AWS_REGION: region
        };

        let buildOptions = {
            package: selectedPackage.name,
            parameters: buildParameters,
        };

        const res = await fetch(path, {
            method: "POST",
            body: JSON.stringify(buildOptions),
            headers: {
                "Content-Type": "application/json"
            },
        });

        logMessage("Sent build request to backend");
        if (res.status == 200) {
            const json = await res.json();
            let result = JSON.stringify(json);
            logMessage("Received response from backend: " + result);
        } else {
            logMessage("Backend reported status: " + res.status);
        }

        selectedPackage = null;
        currentView = Views.Main;
    }

    function logMessage(message) {
        var newMessage = new Date(Date.now()) + " - " + message + "\n";
        log = log + newMessage;
    }

    logMessage("Initialized frontend");
</script>

<h1>One AWS to go, Please!</h1>

{#if currentView == Views.Login}
  <input bind:value={username} type="text" placeholder="Username"/>
  <input bind:value={password} type="password" placeholder="Password"/>

    {#if logInFailed }
        <div class="error">Unauthorized</div>
    {/if}

  <button id="login-button" on:click={processLogin}> Login </button>
{/if}

{#if currentView == Views.Main}
    <div class="column-container">
        <div class="view-column">
            <button id="start-button" on:click={startNewEnvironment}> Start new environment </button>
        </div>

        <div class="view-column">
            <h2 for='log'>Log</h2>
            <textarea id='log' readonly bind:value={log}></textarea>
        </div>
    </div>
{/if}


{#if currentView == Views.PackageSelection}
<div class="column-container">
    <div class="view-column">
        <h2>Available packages</h2>
        <select size='5' single bind:value={selectedPackage}>
            {#each availablePackages as pkg}
            <option value={pkg}>
                {pkg.name}
            </option>
            {/each}
        </select>
        <button id='returnbtn' on:click={returnToMain}> Return </button>
    </div>
    <div class="view-column">
        {#if selectedPackage}
        <h2>Selected package: {selectedPackage.name}</h2>
        <p>{selectedPackage.description}</p>

        <label for="access-key">Access key</label>
        <input id="access-key" bind:value={accesskey}/>

        <label for="region">Region</label>
        <input id='region' bind:value={region}/>

        <label for="secret-key">Secret key</label>
        <input id='secret-key' type=password bind:value={secretkey}/>

        {#if accesskey && region && secretkey}
        <button id="buildbtn" on:click={sendBuildRequest}> Build </button>
        {/if}
        {/if}
    </div>
</div>
{/if}

<style>
:global(body) {
background-color: #2b2b2b;
color: #d6d6d6;
}

h1,
h2 {
    text-align: center;
}

textarea {
    overflow-y: auto;
    height: 100%;
    max-height: 500px;
    width: 100%;
    resize: none;
    outline: 0px solid transparent !important;
}

select {
    display: block;
    margin: 0 auto;
}

.column-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    height: 40vh;
}

.view-column {
    flex: 1;
    position: relative;
}

.view-column p {
    text-align: center;
}

input {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

#secret-key,
#region,
#access-key {
    width: 50%;
    display: block;
    margin: 0 auto;
}

label {
    margin-top: 5%;
    margin-bottom: 2%;
    text-align: center;
}

button{
    padding: 10px 50px 10px 50px;
    color: white;
    display: block;
    margin: 0 auto;
    transition-duration: 0.4s;
}

button:hover{
    background-color: white;
    color: black;
}

#login-button {
    color: black;
    display: block;
    margin: auto !important;
}

#start-button {
    color: black;
    width: 50%;
    margin: 20px;
}

#buildbtn {
    background-color: #008CBA;
    margin-top: 16%;
}

#buildbtn:hover {
    border-color: #008CBA;
}

#returnbtn {
    background-color: #f44336;
    margin-top: 20%;
}

#returnbtn:hover {
    border-color: #f44336;
}

.error {
    display: block;
    margin-left: auto;
    margin-right: auto;
    color: #f00;
    text-align: center;
}
</style>