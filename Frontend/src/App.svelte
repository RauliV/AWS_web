<script>
  const Views = {
    Login: "Login",
    Main: "Main",
    PackageSelection: "PackageSelection",
  };
  let currentView = Views.Login;

  let availablePackages = [];
  let selectedPackage = null;

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
  }

  async function sendBuildRequest() {
    const path = "http://" + window.location.hostname + ":80/api/build";

    let buildOptions = {
      package: selectedPackage.name,
      parameters: [],
    };

    const res = await fetch(path, {
      method: "POST",
      body: JSON.stringify(buildOptions),
      headers: { "Content-Type": "application/json" },
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
    logMessages.push(new Date(Date.now()) + " - " + message);
    logMessages = logMessages;

    if (logMessages.length > 20) {
      logMessages.splice(0, 1);
      logMessages = logMessages;
    }
  }

  let logMessages = [];
  logMessage("Initialized frontend");
</script>

<h1>One AWS to go, Please!</h1>

{#if currentView == Views.Login}
  <button on:click={processLogin}> Login </button>
{/if}

{#if currentView == Views.Main}
  <button on:click={startNewEnvironment}> Start new environment </button>

  <h2>Log</h2>
  <ul class="no-bullets">
    {#each logMessages as logMessage}
      <li>{logMessage}</li>
    {/each}
  </ul>
{/if}

{#if currentView == Views.PackageSelection}
  <h2>Available packages</h2>

  <select single bind:value={selectedPackage}>
    {#each availablePackages as pkg}
      <option value={pkg}>
        {pkg.name}
      </option>
    {/each}
  </select>

  {#if selectedPackage}
    <h2>Selected package: {selectedPackage.name}</h2>
    {selectedPackage.description}

    <button on:click={sendBuildRequest}> Build </button>
  {/if}

  <button on:click={returnToMain}> Return </button>
{/if}

<style>
  ul.no-bullets {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background-color: #2b2b2b;
    color: #d6d6d6;
  }
</style>
