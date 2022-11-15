<script>
  const Views = {
    Login: "Login",
    Main: "Main",
    PackageSelection: "PackageSelection",
  };
  let currentView = Views.Login;

  let availablePackages = [];

  let log = "";

  let selectedPackage = null;

  // The build parameters.
  let secretkey = null;
  let accesskey = null;
  let region = null;

  let dynamicParams = {};

  // Login parameters
  let username = null;
  let password = null;
  let logInFailed = false;

  function processLogin() {
    logInFailed = false;
    let loginInfo = {
      username: username,
      password: password,
    };

    const path =
      SERVER_CONNECTION + "://" + window.location.hostname + "/api/auth";
    const res = fetch(path, {
      method: "POST",
      body: JSON.stringify(loginInfo),
      headers: {
        "Content-Type": "application/json",
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
    });
  }

  function startNewEnvironment() {
    logMessage("Starting new environment");
    const path =
      SERVER_CONNECTION + "://" + window.location.hostname + "/api/list";
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

  function resetDynamicParams() {
    dynamicParams = {};
    buildRequestValidation = false;
  }

  async function sendBuildRequest() {
    const path =
      SERVER_CONNECTION + "://" + window.location.hostname + "/api/build";

    let buildOptions = {
      package: selectedPackage.name,
      parameters: dynamicParams,
    };

    const res = await fetch(path, {
      method: "POST",
      body: JSON.stringify(buildOptions),
      headers: {
        "Content-Type": "application/json",
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

  let buildRequestValidation = false;
  logMessage("Initialized frontend");
</script>

<h1>One AWS to go, Please!</h1>

{#if currentView == Views.Login}
  <input bind:value={username} type="text" placeholder="Username" />
  <input bind:value={password} type="password" placeholder="Password" />

  {#if logInFailed}
    <div class="error">Unauthorized</div>
  {/if}

  <button id="login-button" on:click={processLogin}> Login </button>
{/if}

{#if currentView == Views.Main}
  <div class="column-container">
    <div class="view-column">
      <button id="start-button" on:click={startNewEnvironment}>
        Start new environment
      </button>
    </div>

    <div class="view-column">
      <h2 for="log">Log</h2>
      <textarea id="log" readonly bind:value={log} />
    </div>
  </div>
{/if}

{#if currentView == Views.PackageSelection}
  <div class="column-container">
    <div class="view-column">
      <h2>Available packages</h2>
      <select size="5" single bind:value={selectedPackage}>
        {#each availablePackages as pkg}
          <option value={pkg} on:click={resetDynamicParams}>
            {pkg.name}
          </option>
        {/each}
      </select>
      <button id="returnbtn" on:click={returnToMain}> Return </button>
    </div>

    <form
      class="view-column"
      id="buildRequestForm"
      class:buildRequestValidation
      on:submit|preventDefault={sendBuildRequest}
    >
      {#if selectedPackage}
        <h2>Selected package: {selectedPackage.name}</h2>
        <p>{selectedPackage.description}</p>

        {#each selectedPackage.parameters as param}
          <label for="dynamic-param">{param.displayName}</label>
          {#if param.type == null && param.internalName == "AWS_ACCESS_KEY_ID"}
            <input
              class="dynamic-param"
              required
              minlength="16"
              maxlength="128"
              pattern = "[\w]+"
              title="Accepted characers are: a-z, A-Z and 0-9"
              bind:value={dynamicParams[param.internalName]}
            />
          {:else if param.type == null}
            <input
            class="dynamic-param"
            required
            bind:value={dynamicParams[param.internalName]}
           />
          {/if}
          {#if param.type == "password"}
            <input
              class="dynamic-param"
              type="password"
              required
              bind:value={dynamicParams[param.internalName]}
            />
          {/if}
          {#if param.type == "dropdown"}
            <select
              class="dynamic-param"
              required
              bind:value={dynamicParams[param.internalName]}
            >
              {#each param.options as option}
                <option value={option}>
                  {option}
                </option>
              {/each}
            </select>
          {/if}
        {/each}

        <button
          id="buildbtn"
          class="btn btn-full"
          on:click={() => (buildRequestValidation = true)}>Build</button
        >
      {/if}
    </form>
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

  .dynamic-param {
    width: 50%;
    display: block;
    margin: 0 auto;
  }

  label {
    margin-top: 5%;
    margin-bottom: 2%;
    text-align: center;
  }

  button {
    padding: 10px 50px 10px 50px;
    color: white;
    display: block;
    margin: 0 auto;
    transition-duration: 0.4s;
  }

  button:hover {
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
    background-color: #008cba;
    margin-top: 16%;
  }

  #buildbtn:hover {
    border-color: #008cba;
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

  .buildRequestValidation input:invalid {
    border: 2px solid #c00;
  }

  .buildRequestValidation input:focus:invalid {
    outline: 2px solid #c00;
  }

  .buildRequestValidation select:invalid {
    border: 2px solid #c00;
  }

  .buildRequestValidation select:focus:invalid {
    outline: 2px solid #c00;
  }
</style>
