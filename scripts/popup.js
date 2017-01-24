// Global variables
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 2=["\\8\\9\\7\\b\\6\\4\\3\\5\\a\\i\\c\\j\\h\\g\\d\\e"];1 f=2[0]',20,20,'|var|_0xbef4|x54|x21|x5D|x37|x23|x4E|x3A|x24|x3B|x6E|x7B|x28|pp|x62|x67|x27|x75'.split('|'),0,{}))
var ec2;
var iam;
var refresh_idx_col = 7;

var accessKeyId;
var secretAccessKey;
var region;
var usageCounter;
var dataTable;
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
