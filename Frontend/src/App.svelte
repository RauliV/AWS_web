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

function processLogin() {
    logMessage("Entered main view from login screen");
    currentView = Views.Main;
}

function startNewEnvironment() {
    logMessage("Starting new environment");
    const path = "http://" + window.location.hostname + ":80/api/list";

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

    let secretkey = null;
    let accesskey = null;
    let region = null;

}

async function sendBuildRequest() {
    const path = "http://" + window.location.hostname + ":80/api/build";

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
<button class="login-button" on:click={processLogin}> Login </button>
{/if}

<div class="grid-container">

    {#if currentView == Views.Main}
    <button class="start-button" on:click={startNewEnvironment}> Start new environment </button>

    <h2 class="log-header">Log</h2>
    <textarea readonly bind:value={log}></textarea>
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

    <!--

<div>

Access key id:

<input bind:value={accesskey}/>

</div>

<div>

Region:

<input bind:value={region}/>

</div>

<div>

Secret key:

<input type=password bind:value={secretkey}/>

</div>

{#if accesskey && region && secretkey}
    	<button on:click={sendBuildRequest}> Build </button>

{/if}

  {/if}

    <button on:click={returnToMain}> Return </button>
  {/if}
    -->
</div>

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
    grid-column: 3;
    overflow-y: auto;
    height: 500px;
    resize: none;
    outline: 0px solid transparent !important;
}

select {
    display: block;
    margin: 0 auto;
}

.grid-container {
    display: grid;
    grid: 45% auto 45%;
    column-gap: 50px;
    column-gap: 50px;
}

.log-header {
    grid-area: 1 / 3;
}

.start-button {
    grid-column: 1;
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

.buildbtn:hover{
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

.returnbtn:hover{
  background-color: white;
  border-color: #f44336;
  color: black;
}
</style>
