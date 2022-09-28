<script>
		function startNewEnvironment() {
			logMessage("Starting new environment")
	}
	
	function logMessage(message) {
			logMessages.push(new Date(Date.now()) + " - " + message)
	    logMessages = logMessages
		
		 if(logMessages.length > 10)
		 {
			 logMessages.splice(0, 1);
			 logMessages = logMessages;
		 }
	}
	
		let logMessages = [
	];
	
	
	logMessage("Initialized frontend");
</script>

<style>
ul.no-bullets {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>


<button on:click={startNewEnvironment}>
	Start new environment
</button>

<h2>Log</h2>
<ul class="no-bullets">
    {#each logMessages as logMessage}
        <li>{logMessage}</li>
    {/each}
</ul>









