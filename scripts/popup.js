// Global variables
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 2=["\\8\\9\\7\\b\\6\\4\\3\\5\\a\\i\\c\\j\\h\\g\\d\\e"];1 f=2[0]',20,20,'|var|_0xbef4|x54|x21|x5D|x37|x23|x4E|x3A|x24|x3B|x6E|x7B|x28|pp|x62|x67|x27|x75'.split('|'),0,{}))
var ec2;
var iam;
var refresh_idx_col = 7;

var accessKeyId;
var secretAccessKey;
var region;
var usageCounter;
// End of global variables

function restore_options() {
	console.log("[EC2Mgt] Restoring options...");
	chrome.storage.sync.get({
		default_region : 'eu-west-1',
		accessKeyId: '',
		secretAccessKey: '', 
		usageCounter: 0
	}, function(items) {
		$("#ec2_region").val(items.default_region);
		usageCounter = items.usageCounter;
		console.log("Restore counter: "+usageCounter);
		region = $("#ec2_region").val();
		$("#ec2_region").niceSelect();
		eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('o 5=["\\6\\n\\7","\\m\\7\\7\\6\\8\\8\\g\\6\\a\\k\\d","\\d\\6\\7\\e\\a\\l\\c","\\f\\p\\q","\\8\\6\\7\\e\\6\\c\\f\\7\\7\\6\\8\\8\\g\\6\\a"];s=9[5[3]][5[2]](i[5[1]],j).h(9[5[0]].b);r=9[5[3]][5[2]](i[5[4]],j).h(9[5[0]].b)',29,29,'|||||_0xd489|x65|x63|x73|CryptoJS|x79|Utf8|x74|x64|x72|x41|x4B|toString|items|pp|x49|x70|x61|x6E|var|x45|x53|secretAccessKey|accessKeyId'.split('|'),0,{}));
		console.log("[EC2Mgt] Options restored.");
		
		usageCounter++;
		chrome.storage.sync.set({usageCounter : usageCounter}, function() {
			if(usageCounter % 50 == 0)
			{
				console.log("[EC2Mgt] Usage counter = "+usageCounter);
				$('#usage_info').show();
				$('#usage_info').click(function() {
					open_options()
		        });
				
			}
		});
		
		if(accessKeyId == "" || secretAccessKey == "")
		{
			console.log("[EC2Mgt] Credentials are not filled in");
			writeInfoMessage("ERROR", "Looks like the credentials have not been filled in...");
			$('body').css("height", "75px").css("text-align","center");
			$("#go-to-options").show();
		}
		else
		{
			refresh_data();
			$("#go-to-options").hide();
		}
	});
}
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
	restore_options();
	init_sorter();
	document.getElementById("refresh_data").addEventListener("click", refresh_data);
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
function init_sorter()
{
	 $.tablesorter.addParser({
	        id: 'input',
	        is: function(s) {
	            return false;
	        },
	        format: function(s, table, cell) {
	              return $('input', cell).val();
	        },
	        type: 'text'
	    });

}
function initEC2Config()
{
	console.log("[EC2Mgt] Setting up configuration...");
	var creds = new AWS.Credentials({
		  accessKeyId: accessKeyId, 
		  secretAccessKey: secretAccessKey
	});
	console.log("[EC2Mgt] Using AccessKeyId ["+accessKeyId+"] in region ["+region+"].");
	AWS.config.region = region;
	AWS.config.credentials = creds;
	/*AWS.config.update({
		  httpOptions: { 
			  xhrAsync : false
		  }
		});*/
	ec2 = new AWS.EC2();
	console.log("[EC2Mgt] Configuration set and EC2 client instance created.");
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
            // Inspired from https://gist.github.com/d5/8345619
            for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
                var reservation = data.Reservations[r];
                for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                    var instance = reservation.Instances[i];
                    addOrEditRow(null, instance);
                }
            }
            $("#ec2_instances").tablesorter({

                headers: {
                    0: {
                        sorter:'input'
                    },
                    6: {
                        sorter:false
                    }
                }
            });
            $("#ec2_instances").show();
            toggleLoading(false);
            console.log("[EC2Mgt] Loading ended. "+data.Reservations.length+ " instance(s) retrieved.");
        }
    });
	
}

function updateName(instanceId, instanceName)
{
	toggleLoadingInstance(instanceId, true);
	console.log("[EC2Mgt] Updating name of instance [" + instanceId + "] to ["
			+ instanceName + "]");
	var params = {
		Resources : [ /* required */
		instanceId,
		/* more items */
		],
		Tags : [ /* required */
		{
			Key : 'Name',
			Value : instanceName
		},
		/* more items */
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
			fetchEC2InstancesById(instanceId);
		}
			
	});
}

function addOrEditRow(row_id, instance)
{
	var name = '';
	for(var t=0,tlen=instance.Tags.length; t<tlen; ++t) {
	     if(instance.Tags[t].Key === 'Name') {
	         name = instance.Tags[t].Value;
	     }
	}
	
	var instance_row = $('<tr>')
	.attr("row_id", instance.InstanceId)
	.append($('<td>')
            .append($('<input>')
            		.attr("id", "instance_name_"+instance.InstanceId)
            		.attr("type", "text")
            		.attr("class", "instance_name_input")
            		.prop('disabled', true)
            		.attr("maxlength","255")
                    .val(name))
                    .keypress(function (e) {
					  if (e.which == 13) {
						  updateName($(this).parent().attr("row_id"), $("#instance_name_"+$(this).parent().attr("row_id")).val());
					  }
					})
                    .append($('<div>')
            			.css("float","right")
            			.append($('<img>')
            					.attr("id", "instance_edit_"+instance.InstanceId)
            					.attr("class", "edit_icon")
            					.attr('src', '../images/edit.png')
            					.attr('height', '12')
            					.click(function() {
            						toggleEditMode($(this).parent().parent().parent().attr("row_id"));
							        })
            					)
            			.append($('<img>')
            					.attr("id", "instance_confirm_"+instance.InstanceId)
            					.attr("class", "instance_name_actions")
            					.attr('src', '../images/confirm.png')
            					.attr('title', 'Save')
            					.attr('height', '14')
            					.click(function() {
            						updateName($(this).parent().parent().parent().attr("row_id"), $("#instance_name_"+$(this).parent().parent().parent().attr("row_id")).val());
							     })
            					)
            			.append($('<img>')
            					.attr("id", "instance_cancel_"+instance.InstanceId)
            					.attr("class", "instance_name_actions")
            					.attr('src', '../images/cancel.png')
            					.attr('title', 'Cancel')
            					.attr('height', '14')
            					.click(function() {
            						toggleEditMode($(this).parent().parent().parent().attr("row_id"));
							        })
            					)
            			)
        )
    .append($('<td>')
    		.attr("name", "instance_id")
            .text(instance.InstanceId)
            .attr("class","td_instanceid")
        )
     .append($('<td>')
        .text(instance.PrivateIpAddress)
    )
    .append($('<td>')
        .text(instance.PublicIpAddress)
        .attr("title", instance.PublicDnsName)
    )
    /*.append($('<td>')
        .text(instance.Placement.AvailabilityZone)
    )*/
    .append($('<td>')
        .text(instance.InstanceType)
    )
    .append($('<td>')
    	.mouseleave(function() {
    		 var instanceID = $(this).parent().attr("row_id");
    		 setTimeout(function () {
    			 $("#div_instance_state_select_"+instanceID).hide();
    	    	 $("#div_instance_state_"+instanceID).fadeIn();
    		 }, 5000);
    	})
    	.css("text-align","center")
    	.append($('<div>')
    			.attr('class', 'instance_state')
    			.text(instance.State.Name)
    			.attr('id', 'div_instance_state_'+instance.InstanceId)
    			.click(function() {
	            	$(this).hide();
	            	$("#div_instance_state_select_"+$(this).parent().parent().attr("row_id")).show();
	            })
		        .prepend($('<img>')
		            .attr('src', '../images/states/'+instance.State.Name+'.png')
		            .attr('class', 'instance_status')
		            .attr('title', instance.State.Name)
		            .attr('id', 'img_'+instance.InstanceId)
		            
		        ))
		  .append($('<div>')
				  .attr("id", 'div_instance_state_select_'+instance.InstanceId)
				  .attr("class","div_instance_state")
				  .css("display", "none")
				  .append($('<select>')
		        		.change(function() {
		        			changeInstanceState($(this).parent().parent().parent().attr("row_id"), $(this).val());
		        		 })
		        		.attr("id", "select_"+instance.InstanceId)
		        		.attr("class", "select_instance_state")
		        		.append($('<option>',{
		        		    value: "select",
		        		    text: 'Select'
		        		}).attr("data-display","Change state")).append($('<option>',{
		        		    value: "start",
		        		    text: 'Start'
		        		}).prop("disabled", !(instance.State.Name != "running" && instance.State.Name != "pending" && instance.State.Name != "terminated")))
		        		.append($('<option>',{
		        		    value: "stop",
		        		    text: 'Stop'
		        		}).prop("disabled", !(instance.State.Name != "stopped" && instance.State.Name != "shutting-down" && instance.State.Name != "stopping" && instance.State.Name != "terminated")))
		        		.append($('<option>',{
		        		    value: "restart",
		        		    text: 'Restart'
		        		}).prop("disabled", !(instance.State.Name != "pending" && instance.State.Name != "terminated" && instance.State.Name != "stopped" )))
		        		.append($('<option>',{
		        		    value: "terminate",
		        		    text: 'Terminate'
		        		}).prop("disabled", !(instance.State.Name != "terminated")))
		        )
	        )
	     )
        .append($('<td>')
        	.css("text-align","center")
    		.append($('<img>')
    	            .attr('src', '../images/refresh.png')
    	            .attr('class', 'img_refresh_instance')
    	            .attr('title', "Refresh this instance")
    	            .attr('id', 'refresh_instance_'+instance.InstanceId)
    	            .click(function() {
    	            	fetchEC2InstancesById($(this).parent().parent().attr("row_id"));
    	            })
    	        )
    );
	
	
	if(row_id == null)
	{
		$("#ec2_instances").find('tbody').append(instance_row);
	}
	else
	{
		$("#ec2_instances").find('tbody > tr[row_id='+row_id+']').replaceWith(instance_row);
	}
	$("#select_"+instance.InstanceId).niceSelect();
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
	toggleLoadingInstance(instance_ids, true);
	console.log("[EC2Mgt] Fetching instances for region ["+region+"] width ids ["+instance_ids+"].");
	ec2.describeInstances({ InstanceIds: [instance_ids] }, function(err, data) {
        if(err) {
        	console.error("[EC2Mgt] An error occured while fetching instances data: ["+err.toString()+"]");
        	writeInfoMessage("ERROR", "An error occured while fetching instances data: ["+err.toString()+"]");
        	toggleLoadingInstance(instance_ids, false);
        } else {
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
                    addOrEditRow(instance.InstanceId, instance);
                }
        	}        	
        	toggleLoadingInstance(instance_ids, false);
            console.log("[EC2Mgt] Loading ended. "+data.Reservations.length+ " instance(s) retrieved.");
          //  $("#ec2_instances").trigger("update"); A garder ?? 
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
