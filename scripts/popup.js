


function refresh_data()
{
	
    $("#ec2_instances").hide();
    $("#ec2_instances tbody").empty();
    $("#ec2_region").val(region);
    $("#ec2_region").niceSelect();
    writeInfoMessage("INFO", "");
	toggleLoading(true);
	initEC2Config();
	fetchAccountDetails();
	fetchEC2Instances();
	$("#ec2_region").change(function() {
		region = $("#ec2_region").val();
		initEC2Config();
		refresh_data();
	});
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("go-to-options").addEventListener("click", open_options);
	restore_options(true);
	//init_sorter();
	$("#refresh_data").click(refresh_data);
});

function open_options()
{
	if (chrome.runtime.openOptionsPage) {
	    // New way to open options pages, if supported (Chrome 42+).
	    chrome.runtime.openOptionsPage();
	  } else {
	    // Reasonable fallback.
	    window.open(chrome.runtime.getURL('options.html'));
	  }
}


function fetchAccountDetails()
{
	console.log("[EC2Mgt] Fetching account details...");
	iam = new AWS.IAM();
	iam.getUser({}, function(err, data) {
		if (err)
		{
			console.error("[EC2Mgt] An error occured while fetching account details ["+err.toString()+"]");
			writeInfoMessage("ERROR", "An error occured while fetching account details ["+err.toString()+"]");
	        toggleLoading(false);
		}
		else
		{
			$("#account_id").text(data.User.UserId).click(function() {
				chrome.tabs.create({ url: "https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region="+region });
	        });

			$("#account_name").text(data.User.UserName);
			console.log("[EC2Mgt] User information successfully fetched. ["+data.User.UserId + " / "+data.User.UserName+"]");
			$("#account_info").show();
		}
	});
}

function writeInfoMessage(level, message)
{
	$("#info_div").show();
	$("#info_data").text(message);
	$("#info_data").attr('class', "msg_" + level);
}

function fetchEC2Instances()
{
	console.log("[EC2Mgt] Fetching instances for region ["+region+"]...");
	ec2.describeInstances({}, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while fetching instances data: ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while fetching instances data: ["+err.toString()+"]");
        	toggleLoading(false);
        } else {
            var currentTime = new Date();
            console.log("[EC2Mgt] Data fetched on ["+currentTime.toString()+"]");
            
            //writeInfoMessage("INFO","Data fetched on ["+currentTime.toString()+"]");
            
            var list_instances = [];
            var headers;
            // Inspired from https://gist.github.com/d5/8345619
            for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
                var reservation = data.Reservations[r];
            	
                for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                	if(r == 0 && i == 0) // very first row only for headers
            		{
                		headers = get_headers(reservation.Instances[i]);
            		}
                	var name = '';
                	for(var t=0,tlen=reservation.Instances[i].Tags.length; t<tlen; ++t) {
                	     if(reservation.Instances[i].Tags[t].Key === 'Name') {
                	         name = reservation.Instances[i].Tags[t].Value;
                	     }
                	}
                	reservation.Instances[i].DT_RowId = reservation.Instances[i].InstanceId; // Custom row identifier for DataTable
                	reservation.Instances[i].InstanceName = name; // Name of the instance
                	list_instances.push(reservation.Instances[i]);
                }
            }            
            $("#ec2_instances").show();
            
            toggleLoading(false);
            dataTable = $('#ec2_instances').DataTable({
            	data: list_instances,
     	        columnDefs: columns_renderer,
     	        fnDrawCallback: function( oSettings ) {
     	            set_events();
     	        }, 
     	        bDestroy: true
    	      });
            
           
            console.log("[EC2Mgt] Loading ended. "+data.Reservations.length+ " instance(s) retrieved.");
        }
    });
	
}

function set_events()
{
	$('div[id^=\'div_inst_state_container_\']').unbind( "click" ).click(function () {
       	$(this).hide();
       	$("#div_instance_state_select_"+$(this).parent().parent().attr("id")).show();
	});
	$('select[id^=\'select_\']').change(function() {
		changeInstanceState($(this).parent().parent().parent().attr("id"), $(this).val());
	 });
	$('select[id^=\'select_\']').niceSelect();
	
	$('input[id^=\'instance_name_\']').unbind( "keypress" ).keypress(function (e) {
   		if (e.which == 13) {
			  updateName($(this).parent().parent().attr("id"), $("#instance_name_"+$(this).parent().parent().attr("id")).val());
		  }
	});
	$('img[id^=\'instance_edit_\'], img[id^=\'instance_cancel_\']').unbind( "click" ).click(function (e) {
		toggleEditMode($(this).parent().parent().parent().attr("id"));
	});

	$('img[id^=\'instance_confirm_\']').unbind( "click" ).click(function (e) {
		updateName($(this).parent().parent().parent().attr("id"), $("#instance_name_"+$(this).parent().parent().parent().attr("id")).val());
	});
	$('img[id^=\'refresh_instance_\']').unbind( "click" ).click(function (e) {
		fetchEC2InstancesById($(this).parent().parent().attr("id"));
	});
	$("#ec2_instances tr td:nth-child(1)").each(function () {
		$(this).addClass("td_name");
	});
	$("#ec2_instances tr td:nth-child(2)").each(function () {
		$(this).addClass("td_instanceid");
	});
	$("#ec2_instances tr td:nth-child(6)").each(function () {
		$(this).addClass("td_state");
	});
	$("#ec2_instances tr td:nth-child(7)").each(function () {
		$(this).addClass("td_refresh");
	});
	$(".td_state").unbind( "mouseleave" ).mouseleave(function() {
	 var instanceID = $(this).parent().attr("id");
   		 setTimeout(function () {
   			 $("#div_instance_state_select_"+instanceID).hide();
   	    	 $("#div_inst_state_container_"+instanceID).fadeIn();
   		 }, 5000);
   	});
}
function updateName(instanceId, instanceName)
{
	toggleLoadingInstance(instanceId, true);
	console.log("[EC2Mgt] Updating name of instance [" + instanceId + "] to ["
			+ instanceName + "]");
	var params = {
		Resources : [ instanceId ],
		Tags : 
		[
			{
				Key : 'Name',
				Value : instanceName
			}
		]
	};
	ec2.createTags(params, function(err, data) {
		if (err) {
			console.error("[EC2Mgt] An error occured while renaming instance ["
					+ instanceId + "]. Error was: [" + err.toString() + "]");
			writeInfoMessage("ERROR",
					"An error occured while renaming instance [" + instanceId
							+ "]. Error was: [" + err.toString() + "]");
			toggleLoadingInstance(instanceId, false);
		} else
		{
			console.log(data); // successful response
			toggleLoadingInstance(instanceId, false);
			$("#instance_name_"+instanceId).prop("disabled", true);
			fetchEC2InstancesById(instanceId);
		}
			
	});
}

function toggleEditMode(instance_id)
{
	$("#instance_name_"+instance_id).prop("disabled",!$("#instance_name_"+instance_id).prop("disabled"));
	$("#instance_edit_"+instance_id).toggle();
	$("#instance_confirm_"+instance_id).toggle();
	$("#instance_cancel_"+instance_id).toggle();
	
}

function fetchEC2InstancesById(instance_ids)
{
	var returnedRow;
	toggleLoadingInstance(instance_ids, true);
	console.log("[EC2Mgt] Fetching instances for region ["+region+"] width ids ["+instance_ids+"].");
	ec2.describeInstances({ InstanceIds: [instance_ids] }, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while fetching instances data: ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while fetching instances data: ["+err.toString()+"]");
        	toggleLoadingInstance(instance_ids, false);
        } else {
        	var list_instances = [];
        	for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
                var reservation = data.Reservations[r];
                for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                    var instance = reservation.Instances[i];

                    var name = '';
                    for(var t=0,tlen=instance.Tags.length; t<tlen; ++t) {
                        if(instance.Tags[t].Key === 'Name') {
                            name = instance.Tags[t].Value;
                        }
                    }
                	reservation.Instances[i].DT_RowId = reservation.Instances[i].InstanceId; // Custom row identifier for DataTable
                	reservation.Instances[i].InstanceName = name; // Name of the instance
                	dataTable.row( $('tr#'+instance.InstanceId) ).data( reservation.Instances[i] ).draw("page");
                }
        	}        	
        	toggleLoadingInstance(instance_ids, false);
            console.log("[EC2Mgt] Loading ended. "+data.Reservations.length+ " instance(s) retrieved.");
        }
	  });
}



function changeInstanceState(instance_id, new_state)
{
	if(new_state != "select")
	{
		if(new_state == "start")
		{
			startInstance(instance_id);
		} 
		else if(new_state == "stop")
		{
			stopInstance(instance_id);
		}
		else if(new_state == "restart")
		{
			restartInstance(instance_id);
		}
		else if(new_state == "terminate")
		{
			terminateInstance(instance_id);
		}
		fetchEC2InstancesById(instance_id);
	}
	
}

function toggleLoading(set_visible) 
{
	if(set_visible)
	{
		$("#loading").show();
		$("#img_refresh").hide();
	}
	else
	{
		$("#loading").hide();
		$("#img_refresh").show();
	}
}
function toggleLoadingInstance(instance_id, set_visible) 
{
	if(!$.isArray(instance_id)) {
		toggleLoadingUniqueInstance(instance_id, set_visible);
	}
	else
	{
		$.each(instance_id, function( index, value ) {
			toggleLoadingUniqueInstance(value, set_visible);
		});
	}
}
function toggleLoadingUniqueInstance(instance_id, set_visible) 
{
	if(set_visible)
	{
		$("#refresh_instance_"+instance_id).attr("src", "../images/load.gif");
	}
	else
	{
		$("#refresh_instance_"+instance_id).attr("src", "../images/refresh.png");
	}
}
