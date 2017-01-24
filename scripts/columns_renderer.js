function get_headers(obj)
{
	var headers = [];
	Object.keys(obj).forEach(function(key,index) {
		headers.push({"title": key});
	});
	return headers;
}

$.fn.dataTableExt.ofnSearch['html-input'] = function(value) {
    return $(value).val();
};

var columns_renderer = 
[
	{
		"type": "html-input", 
		"targets": [0] 
	},
	{
		"data": "InstanceName",
		"targets" : 0, // Instance Id
		"render": function(data, type, instance) {
			return "<input id=\"instance_name_"+instance.InstanceId+"\" type=\"text\" class=\"instance_name_input\" disabled maxlength=\"255\" value=\""+data+"\">"
				+ "<div style=\"float: right;\">"
				+ "<img id=\"instance_edit_"+instance.InstanceId+"\" class=\"edit_icon\" src=\"../images/edit.png\" height=\"12\">"
				+ "<img id=\"instance_confirm_"+instance.InstanceId+"\" class=\"instance_name_actions\" src=\"../images/confirm.png\" title=\"Save\" height=\"12\">"
				+ "<img id=\"instance_cancel_"+instance.InstanceId+"\" class=\"instance_name_actions\" src=\"../images/cancel.png\" title=\"Cancel\" height=\"12\">"
			;
		}
	},
	{
		"data": "InstanceId",
		"targets" : 1 // InstanceId
	},
	{
		"data": "PrivateIpAddress",
		"targets" : 2 // PrivateIpAddress
	},
	{
		"data": "PublicIpAddress",
		"defaultContent": "",
		"targets" : 3 // PublicIpAddress
	},
	{
		"data": "InstanceType",
		"targets" : 4 // InstanceType
	},
	{
		"data": "State",
		"render" : function(data, type, row) {
			var instanceID = row.InstanceId;
			var instanceStateName = data.Name;
			
			return "<div class=\"instance_state\" id=\"div_inst_state_container_"+instanceID+"\">"
					+ "<img id=\"img_"+instanceID+"\" title=\""+instanceStateName+"\" class=\"instance_status\" src=\"../images/states/"+instanceStateName+".png\">"
					+ instanceStateName+"</div>"
					+ "<div style=\"display:none;\" class=\"div_instance_state\" id=\"div_instance_state_select_"+instanceID+"\">"+instanceStateName
					+ "	<select id=\"select_"+instanceID+"\" class=\"select_instance_state\">"
					+ "		<option value=\"select\" data-display=\"Change state\">Select</option>"
					+ "		<option value=\"start\" "+(!(instanceStateName != "running" && instanceStateName != "pending" && instanceStateName != "terminated") ? "disabled":"") +">Start</option>"
					+ "		<option value=\"stop\" "+(!(instanceStateName != "stopped" && instanceStateName != "shutting-down" && instanceStateName != "stopping" && instanceStateName != "terminated") ? "disabled":"") +">Stop</option>"
					+ "		<option value=\"restart\ "+(!(instanceStateName != "pending" && instanceStateName != "terminated" && instanceStateName != "stopped" ) ? "disabled":"") +">Restart</option>"
					+ "		<option value=\"terminate\ "+( !(instanceStateName != "terminated") ? "disabled":"") +">Terminate</option>"
					+ "	</select>"
					+"</div>";
		},
		"targets" : 5 // State
	},
	{
		"data": "PrivateDnsName",
	    "visible": false,
		"targets" : 6 // PrivateDnsName
	},
	{
		"data": "PublicDnsName",
	    "visible": false,
		"targets" : 7 // PublicDnsName
	},
	{
		"data": "StateTransitionReason",
	    "visible": false,
		"targets" : 8 // StateTransitionReason
	},
	{
		"data": "KeyName",
	    "visible": false,
		"targets" : 9 // KeyName
	},
	{
		"data": "AmiLaunchIndex",
	    "visible": false,
		"targets" : 10 // AmiLaunchIndex
	},
	{
		"data": "ProductCodes",
	    "visible": false,
		"targets" : 11 // ProductCodes
	},
	{
		"data": "LaunchTime",
	    "visible": false,
		"targets" : 12 // LaunchTime
	},
	{
		"data": "Placement",
	    "visible": false,
		"targets" : 13 // Placement
	},
	{
		"data": "KernelId",
	    "visible": false,
		"defaultContent": "<i>Not set</i>",
		"targets" : 14 // KernelId
	},
	{
		"data": "Monitoring",
	    "visible": false,
		"targets" : 15 // Monitoring
	},
	{
		"data": "SubnetId",
	    "visible": false,
		"targets" : 16 // SubnetId
	},
	{
		"data": "VpcId",
	    "visible": false,
		"targets" : 17 // VpcId
	},
	{
		"data": "StateReason",
		"defaultContent": "",
	    "visible": false,
		"targets" : 18 // StateReason
	}
	,
	{
		"data": "Architecture",
	    "visible": false,
		"targets" : 19 // Architecture
	}
	,
	{
		"data": "RootDeviceType",
	    "visible": false,
		"targets" : 20 // RootDeviceType
	}
	,
	{
		"data": "RootDeviceName",
	    "visible": false,
		"targets" : 21 // RootDeviceName
	}
	,
	{
		"data": "BlockDeviceMappings",
	    "visible": false,
		"targets" : 22 // BlockDeviceMappings
	}
	,
	{
		"data": "VirtualizationType",
	    "visible": false,
		"targets" : 23 // VirtualizationType
	}
	,
	{
		"data": "ClientToken",
	    "visible": false,
		"targets" : 24 // ClientToken
	},
	{
		"data": "SecurityGroups",
	    "visible": false,
		"targets" : 25 // SecurityGroups
	},
	{
		"data": "SourceDestCheck",
	    "visible": false,
		"targets" : 26 // SourceDestCheck
	},
	{
		"data": "Hypervisor",
	    "visible": false,
		"targets" : 27 // Hypervisor
	},
	{
		"data": "NetworkInterfaces",
	    "visible": false,
		"targets" : 28 // NetworkInterfaces
	},
	{
		"data": "EbsOptimized",
	    "visible": false,
		"targets" : 29 // EbsOptimized
	},
	{
		"data": "ImageId",
	    "visible": false,
		"targets" : 30 // ImageId
	},
	{
		"data": "",
		"orderable": false, 
	    "render": function(data, type, row) {
			var instanceID = row.InstanceId;
			return "<img src=\"../images/refresh.png\" class=\"img_refresh_instance\" title=\"Refresh this instance\" id=\"refresh_instance_"+instanceID+"\">";
	    },	    	
		"targets" : 31 // Refresh icon
	}
];