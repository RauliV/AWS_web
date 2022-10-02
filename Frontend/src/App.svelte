<script>
  const Views = {
    Login: "Login",
    Main: "Main",
    PackageSelection: "PackageSelection",
  };
  let currentView = Views.Login;

  let availablePackages = [];

  console.log(availablePackages);
  console.log(typeof availablePackages);

  let selectedPackage = null;

  function processLogin() {
    logMessage("Entered main view from login screen");
    currentView = Views.Main;
  }

  function startNewEnvironment() {
    logMessage("Starting new environment");
    const path = "http://localhost:8080/list";

    const response = fetch(path)
      .then((response) => response.json())
      .then((data) => {
        logMessage("Available package data fetched from backend");
        availablePackages = [];
        selectedPackage = null;
        availablePackages = Array.from(data.packages);
        currentView = Views.PackageSelection;
      })
      .catch((error) => {
        logMessage(error);
        availablePackages = [];
        selectedPackage = null;
        return [];
      });
  }

  function buildEnvironment() {
    logMessage("(NOT IMPLEMENTED) Sent build request to backend");
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

    <button on:click={buildEnvironment}> Build </button>
  {/if}
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
