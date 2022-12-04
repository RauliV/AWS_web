<script>
  import { onMount, tick } from "svelte";

  let basepath = "";
  let DOCKER;
  if(typeof DOCKER_RUN === 'undefined') {
    DOCKER = false;
  } else {
    DOCKER = DOCKER_RUN;
  }
  if(!DOCKER) {
    basepath = "http://localhost:8080";
  } else {
    basepath = SERVER_CONNECTION + "://" + window.location.hostname;
  }
  
  const Views = {
    Login: "Login",
    Main: "Main",
    PackageSelection: "PackageSelection",
  };
  let currentView = Views.Login;

  let availablePackages = [];

  let log = [];
  let latestStatus = "-";

  let selectedPackage = null;
  let dynamicParams = {};

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
  let lastStatus = "";
  let lastStepName = "";

  // bool to ensure that backend calls aren't performed multiple times
  let waitingForActionToResolve = false;

  // bool for mock build checkbox state
  let mockAction = false;

  const update = () => {
    if (updating) {
      getBuildStatus();
    }
  };

  let clear;
  $: {
    clearInterval(clear);
    clear = setInterval(update, 5000);
  }

  function processLogin() {
    if (waitingForActionToResolve) return;
    waitingForActionToResolve = true;

    logInFailed = false;
    let loginInfo = {
      username: username,
      password: password,
    };

    const path = basepath + "/api/auth";
    const res = fetch(path, {
      method: "POST",
      body: JSON.stringify(loginInfo),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status == 200) {
        logMessage("Entered main view from login screen", "white");
        currentView = Views.Main;
        username = "";
        password = "";
      } else {
        logInFailed = true;
      }
      waitingForActionToResolve = false;
    });

  }

  function startNewEnvironment() {
    if (waitingForActionToResolve) return;
    waitingForActionToResolve = true;

    logMessage("Starting new environment", "white");
    const path = basepath + "/api/list";
    const response = fetch(path)
      .then((response) => response.json())
      .then((data) => {
        logMessage("Available package data fetched from backend", "turquoise");
        availablePackages = [];
        selectedPackage = null;
        availablePackages = Array.from(data.templates);
        currentView = Views.PackageSelection;
        waitingForActionToResolve = false;
      })
      .catch((error) => {
        logMessage(error, "salmon");
        availablePackages = [];
        selectedPackage = null;
        waitingForActionToResolve = false;
        return [];
      });
  }

  function returnToMain() {
    logMessage("Returned to main view from package selection screen", "white");
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

  function on_key_down(event) {
    // Assuming you only want to handle the first press, we early
    // return to skip.
    if (event.repeat) return;

    switch (event.key) {
      case "Enter":
        if (currentView == Views.Login) {
          // By using `preventDefault`, it tells the Browser not to handle the
          // key stroke for its own shortcuts or text input.
          event.preventDefault();
          processLogin();
        }
        break;
    }
  }

  async function sendBuildRequest() {
    if (waitingForActionToResolve) return;
    waitingForActionToResolve = true;

    const path = basepath + "/api/build";

    let buildOptions = {
      package: selectedPackage.name,
      parameters: dynamicParams,
      mock: mockAction
    };

    const res = await fetch(path, {
      method: "POST",
      body: JSON.stringify(buildOptions),
      headers: {
        "Content-Type": "application/json",
      },
    });

    logMessage("Sent build request to backend", "white");
    if (res.status == 200) {
      latestStatus = "Started"
      const json = await res.json();
      let result = JSON.stringify(json);
      logMessage("Received response from backend: " + result, "turquoise");
      updating = true;
    } else {
      latestStatus = "Failed to Start"
      logMessage("Backend reported status: " + res.status, "yellow");
    }

    selectedPackage = null;
    currentView = Views.Main;
    waitingForActionToResolve = false;
  }

  async function getBuildStatus(/*buildId*/) {
    const path = basepath + "/api/status";
    const res = await fetch(path);
    if (res.status == 200) {
      let state = await res.json();
      if (state.status === "completed") {
        updating = false; // We got the last status.
        lastStatus = "";
        lastStepName = "";
        if (state.conclusion === "success") {
          latestStatus = "Success";
          logMessage(`Current build status: Success!`, "lime");
        } else {
          latestStatus = "Failed";
          logMessage(
            `Current build status: Failed! (${state.stepNumber}/${state.stepCount}) - ${state.stepName}`,
            "salmon"
          );
          logMessage(`Error: ${state.errorMessage}`, "salmon");
        }
        return;
      } else if (
        lastStatus === state.status &&
        lastStepName === state.stepName
      ) {
        // Status did not change, not logging.
        return;
      } else if (state.status === "in_progress") {
        latestStatus = "In Progress";
        lastStatus = state.status;
        lastStepName = state.stepName;
        logMessage(
          `Current build status: In Progress (${state.stepNumber}/${state.stepCount}) - ${state.stepName}`,
          "turquoise"
        );
        return;
      } else {
        latestStatus = "In Progress";
        lastStatus = state.status;
        lastStepName = state.stepName;
        logMessage(`Current build status: ${state.status}`, "turquoise");
        return;
      }
    }
  }

  async function logMessage(message, color = "white") {
    message =
      new Date(Date.now()).toISOString().substring(0, 23) +
      " - " +
      message +
      "\n";

    // format color string for style
    if (color.substring(0, 6) != "color:") {
      color = "color:" + color;
    }

    let messageObj = {
      message: message,
      style: color,
    };
    log.push(messageObj);

    if (log.length > 200) {
      log.splice(0, 1);
    }

    log = log;
    await tick();
    scrollToBottom(logScrollbar);
  }

  function clearLog() {
    log = [];
    logMessage("Cleared log", "white");
  }

  const scrollToBottom = async (node) => {
    if (node != undefined) {
      node.scroll({ top: node.scrollHeight, behavior: "smooth" });
    }
  };
  let logScrollbar;
  onMount(() => scrollToBottom(logScrollbar));

  let buildRequestValidation = false;
  logMessage("Initialized frontend", "white");
</script>

<svelte:window on:keydown={on_key_down} />

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
      <h2 for="log">Latest status: {latestStatus}</h2>
      <div>
        <ul bind:this={logScrollbar}>
          {#each log as messageObj}
            <li style={messageObj.style}>{messageObj.message}</li>
          {/each}
        </ul>
      </div>
      <button id="clearlogbtn" on:click={clearLog}> Clear log </button>
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
              pattern="[\w]+"
              title="Valid characters: a-z, A-Z and 0-9"
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

        <label>
          <input type=checkbox bind:checked={mockAction}>
          Run mock build
        </label>

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
    background-color: #2bb368;
    width: 50%;
    margin: 20px;
  }

  #start-button:hover {
    border-color: #2bb368;
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

  #clearlogbtn {
    background-color: #36a8f4;
    margin-top: 20%;
  }

  #clearlogbtn:hover {
    border-color: #36a8f4;
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

  ul {
    list-style: none;
    max-height: 400px;
    min-height: 400px;
    margin: 0;
    overflow: auto;
    padding: 0;
    text-indent: 10px;
    background-color: #383838;
  }

  li {
    line-height: 25px;
  }
</style>
