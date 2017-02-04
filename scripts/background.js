document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.sync.get({
		intervalFetchRunning: 30
	}, function(items) {
		if(items.intervalFetchRunning != 0)
		{
			chrome.alarms.create("fetchRunningInstances", {delayInMinutes: 1, periodInMinutes: parseInt(items.intervalFetchRunning)} );
		}
	});
	
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	restore_options(false, initEC2Config, fetchRunningInstances);
	console.log("[EC2Mgt] Next running instances fetch in "+alarm.periodInMinutes+" minutes.");
});

function fetchRunningInstances()
{
	var params = { Filters: [{ Name: "instance-state-name",  Values: [ "running" ] } ] };
	ec2.describeInstances(params, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while fetching instances data: ["+err.toString()+"]");
        } else {
        	if(data.Reservations.length > 0)
    		{
        		chrome.browserAction.setBadgeBackgroundColor({color: [0, 200, 0, 1]});
            	chrome.browserAction.setBadgeText({text:  data.Reservations.length.toString()});
    		}
        	else
    		{
        		chrome.browserAction.setBadgeText({text: ""});
    		}
        }
    });
}