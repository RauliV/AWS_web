<script>
	const Views = {
		Login: "Login",
		Main: "Main",
		PackageSelection: "PackageSelection",
	}
	let currentView = Views.Login;
	
	let availablePackages = [
		{
			name: "package 1 name",
			description: "package 1 description"
		},
		{
			name: "package 2 name",
			description: "package 2 description"
		}
	];
	
	let selectedPackage = null;
	
	function processLogin() {
		logMessage("Entered main view from login screen")
		currentView = Views.Main;
	}
	
	function startNewEnvironment() {
		logMessage("Starting new environment")
		const response = fetch('http://localhost:8080/list')
			.then(response => response.json())
			.then(data => {
				console.log(data);
				availablePackages = [];
				selectedPackage = null;
				logMessage(data);
				logMessage("Available package data fetched from backend")
				currentView = Views.PackageSelection;
			}).catch(error => {
				logMessage(error + " -  Failed to fetch available package data from http://backend:3000/list");
				availablePackages = [];
				selectedPackage = null;
				return [];
  		});
	}
	
	function buildEnvironment() {
		logMessage("(NOT IMPLEMENTED) Sent build request to backend")
		selectedPackage = null;
		currentView = Views.Main;
	}
	
	function logMessage(message) {
		logMessages.push(new Date(Date.now()) + " - " + message)
	    logMessages = logMessages
		
		if(logMessages.length > 20)
		{
			logMessages.splice(0, 1);
			logMessages = logMessages;
		}
	}
	
	let logMessages = [];
	logMessage("Initialized frontend");
</script>

<style>
	ul.no-bullets {
	  list-style-type: none;
	  margin: 0;
	  padding: 0;
	}
	
	:global(body) {
		background-color: #2B2B2B;
		color: #D6D6D6;
	}
</style>



<h1>One AWS, Please!</h1>

{#if currentView == Views.Login}
	<button on:click={processLogin}>
		Login
	</button>
{/if}

{#if currentView == Views.Main}
	<button on:click={startNewEnvironment}>
		Start new environment
	</button>

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

		<button on:click={buildEnvironment}>
			Build
		</button>
	{/if}
{/if}













