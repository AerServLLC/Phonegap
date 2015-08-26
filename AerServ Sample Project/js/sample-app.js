function loadInterstitial() {
	var plc = document.getElementById('plc').value;

	clearStatus();
	updateStatus("Loading PLC: " + plc);

	window.AerServSDK.loadInterstitial(plc,
			function(){

				updateStatus("Ad loaded");
				
			},
			function(message){

				updateStatus("Ad failed: " + message);
				
			},
			function(){

				updateStatus("Ad shown");
				
			},
			function(){

				updateStatus("Ad clicked");
				
			},
			function(){

				updateStatus("Ad dismissed");
			},
                        function() {
                                updateStatus("Preload ready");
                        },
			function(name, amount) {
				updateStatus("VC ready, name=" + name + ", amount=" + amount);
			},
			function(name, amount) {
				updateStatus("VC rewarded, name=" + name + ", amount=" + amount);
			},
			"foo1,foo2", false);

}

function preloadInterstitial() {

	var plc = document.getElementById('plc').value;

	clearStatus();
	updateStatus("Loading PLC: " + plc);

	window.AerServSDK.loadInterstitial(plc,
			function(){

				updateStatus("Ad loaded");

			},
			function(message){

				updateStatus("Ad failed: " + message);

			},
			function(){

				updateStatus("Ad shown");

			},
			function(){

				updateStatus("Ad clicked");

			},
			function(){

				updateStatus("Ad dismissed");
			},
			function() {
				updateStatus("Preload ready");
			},
			function(name, amount) {
				updateStatus("VC ready, name=" + name + ", amount=" + amount);
			},
			function(name, amount) {
				updateStatus("VC rewarded, name=" + name + ", amount=" + amount);
			},
			"foo1,foo2", true);

}

function showInterstitial() {
	window.AerServSDK.showInterstitial();
}

function loadBanner() {

	var plc = document.getElementById('plc').value;
	clearStatus();
	updateStatus("Loading PLC: " + plc);

	window.AerServSDK.loadBanner(plc, 325, 50, AerServSDK.BANNER_BOTTOM,
			function(){

				updateStatus("Ad loaded");
				
			},
			function(message){

				updateStatus("Ad failed: " + message);
				
			},
			function(){

				updateStatus("Ad shown");
				
			},
			function(){

				updateStatus("Ad clicked");
				
			},
			function(){

				updateStatus("Ad dismissed");
            },
			function(name, amount){
				updateStatus("VC ready, name=" + name + ", amount=" + amount);
			},
			function(name, amount){
				updateStatus("VC rewarded, name=" + name + ", amount=" + amount);
			},
			"foo1,foo2");

}

function killBanner() {

	window.AerServSDK.killBanner();

}

function updateStatus(message) {

	document.getElementById('status').innerHTML += message + "</br>";
	
}


function clearStatus() {
	
	document.getElementById('status').innerHTML = "";

}