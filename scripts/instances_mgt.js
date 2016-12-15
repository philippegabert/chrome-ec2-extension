function startInstance(instance_ids)
{
	console.log("[EC2Mgt] Starting instances ["+instance_ids+"]...");
	ec2.startInstances({ InstanceIds: [instance_ids] }, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while starting instance(s): ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while starting instance(s): ["+err.toString()+"]");
        	toggleLoading(false);
        } else {
        	console.log("[EC2Mgt] Instance(s) starting. ");
        	console.log(data);
        }
    });
}
function restartInstance(instance_ids) // Not sure if it actually works... :-(
{
	console.log("[EC2Mgt] Restarting instances ["+instance_ids+"]...");
	ec2.rebootInstances({ InstanceIds: [instance_ids] }, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while restarting instance(s): ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while restarting instance(s): ["+err.toString()+"]");
        	toggleLoading(false);
        } else {
        	console.log("[EC2Mgt] Instance(s) restarting. ");
        	console.log(data);
        }
    });
}
function stopInstance(instance_ids)
{
	console.log("[EC2Mgt] Stopping instances ["+instance_ids+"]...");
	ec2.stopInstances({ InstanceIds: [instance_ids] }, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while stopping instance(s): ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while stopping instance(s): ["+err.toString()+"]");
        	toggleLoading(false);
        } else {
        	console.log("[EC2Mgt] Instance(s) stopping. ");
        	console.log(data);
        }
    });
}
function terminateInstance(instance_ids)
{
	if (confirm('Are you really sure you want to terminate the instance(s) '+instance_ids+' ?')) {
		console.log("[EC2Mgt] Terminating instances ["+instance_ids+"]...");
		/*ec2.terminateInstances({ InstanceIds: [instance_ids] }, function(err, data) {
	        if(err) {
	        	console.error("[EC2Mgt] An error occured while terminating instance(s): ["+err.toString()+"]");
	        	writeInfoMessage("ERROR", "An error occured while terminating instance(s): ["+err.toString()+"]");
	        	toggleLoading(false);
	        } else {
	        	console.log("[EC2Mgt] Instance(s) terminating. ");
	        	console.log(data);
	        }
	    });*/
	} else {
	    console.log("[EC2Mgt] User has cancelled termination.");
	}
	
}