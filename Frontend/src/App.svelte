<script>
import { onMount } from 'svelte';

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
// For updating the build status
let updating = false;
let last_status = '';

const update = () => {
    if (updating) {
        getBuildStatus()
    }
}

let clear
 $: {
	 clearInterval(clear)
	 clear = setInterval(update, 5000)
 }



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
      //getBuildStatus();
      updating = true;
    } else {
        logMessage("Backend reported status: " + res.status);
    }

    selectedPackage = null;
    currentView = Views.Main;
}

  async function getBuildStatus(/*buildId*/) {
    const path = SERVER_CONNECTION + "://" + window.location.hostname + "/api/status";
    const res = await fetch(path);
    if( res.status == 200 ){
        let state = await res.json();
        if(state.status === 'completed'){
            updating = false;  // We got the last status.
            last_status = state.status
            logMessage( `Current build status: ${state.status}, ${state.conclusion}`);
            return;
        } else if (last_status === state.status) {
            // Status did not change, not logging.
            return;
        } else {
            last_status = state.status;
            logMessage( `Current build status: ${state.status}`);
            return;
        }

        
    }
  }

  function logMessage(message) {
		var newMessage = new Date(Date.now()) + " - " + message + "\n";
		log = log + newMessage;
  }

logMessage("Initialized frontend");
</script>

<h1>One AWS to go, Please!</h1>

{#if currentView == Views.Login}
  <input class="username" bind:value={username} type="text" placeholder="Username"/>
  <input class="password" bind:value={password} type="password" placeholder="Password"/>

    {#if logInFailed }
        <div class="error">Unauthorized</div>
    {/if}

  <button class="login-button" on:click={processLogin}> Login </button>
{/if}

{#if currentView == Views.Main}
    <div class="main-view-container">
        <div class="main-view-right">
            <button class="start-button" on:click={startNewEnvironment}> Start new environment </button>
        </div>

        <div class="main-view-left">
            <h2 for='log'>Log</h2>
            <textarea id='log' readonly bind:value={log}></textarea>
        </div>
    </div>
{/if}


{#if currentView == Views.PackageSelection}
<div class="package-view-container">
    <div class="package-view-left">
        <h2>Available packages</h2>
        <select size='5' single bind:value={selectedPackage}>
            {#each availablePackages as pkg}
            <option value={pkg}>
                {pkg.name}
            </option>
            {/each}
        </select>
        <button class='returnbtn' on:click={returnToMain}> Return </button>
    </div>
    <div class="package-view-right">
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
        <button class="buildbtn" on:click={sendBuildRequest}> Build </button>
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

.login-button {
    display: block;
    margin-left: auto;
    margin-right: auto;
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

.main-view-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    height: 40vh;
}
.main-view-left {
    flex: 1;
    position: relative;
}

.main-view-right {
    flex: 1;
    position: relative;
}

.start-button {
    width: 50%;
    margin: 20px;
}

.package-view-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    height: 40vh;

}

.package-view-left {
    flex: 1;
    position: relative;
}

.package-view-right {
    flex: 1;
    position: relative;
}

.package-view-right p {
    text-align: center;
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

.buildbtn {
    padding: 10px 50px 10px 50px;
    color: white;
    background-color: #008CBA;
    display: block;
    margin: 0 auto;
    margin-top: 16%;
    transition-duration: 0.4s;
}

.buildbtn:hover {
    background-color: white;
    border-color: #008CBA;
    color: black;
}

.returnbtn {
    padding: 10px 50px 10px 50px;
    color: white;
    background-color: #f44336;
    display: block;
    margin: 0 auto;
    margin-top: 20%;
    transition-duration: 0.4s;
}

.returnbtn:hover {
    background-color: white;
    border-color: #f44336;
    color: black;
}

.username {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

.password {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.error {
    display: block;
    margin-left: auto;
    margin-right: auto;
    color: #f00;
    text-align: center;
}
</style>
