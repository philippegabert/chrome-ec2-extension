function get_headers(obj)
{
	var headers = [];
	Object.keys(obj).forEach(function(key,index) {
		headers.push({"title": key});
	});
	return headers;
}

$.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
{
    return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
        return $('input', td).val().toUpperCase();
    } );
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
		"defaultContent": "<i>Not set</i>",
		"orderDataType": "dom-text",
		"targets" : 0, // Instance Id
		"render": function(data, type, instance) {
			return "<input id=\"instance_name_"+instance.InstanceId+"\" type=\"text\" class=\"instance_name_input\" disabled maxlength=\"255\" value=\""+data+"\">"
				+ "<div style=\"float: right;\">"
				+ "<img id=\"instance_edit_"+instance.InstanceId+"\" class=\"edit_icon\" src=\"../images/edit.png\" height=\"12\">"
				+ "<img id=\"instance_confirm_"+instance.InstanceId+"\" class=\"instance_name_actions\" src=\"../images/confirm.png\" title=\"Save\" height=\"12\">"
				+ "<img id=\"instance_cancel_"+instance.InstanceId+"\" class=\"instance_name_actions\" src=\"../images/cancel.png\" title=\"Cancel\" height=\"12\">";
			;
		}
	},
	{
		"data": "InstanceId",
		"targets" : 1 // InstanceId
	},
	{
		"data": "PrivateIpAddress",
		"defaultContent": "<i>Not set</i>",
		"targets" : 2, 
		"render" : function(data, type, row) {
			return "<img title=\"Private IP Address\" src=\"../images/lock.png\" height=\"12px\" style=\"vertical-align=:middle\"> "+ data + "<br>" + (row.PublicIpAddress === undefined ? "" : "<img title=\"Public IP Address\" src=\"../images/earth.png\" style=\"vertical-align=:middle\" height=\"12px\"> " +row.PublicIpAddress);
		}
	},
	{
		"data": "Tags",
		"defaultContent": "",
		"render": function(data, type, instance) {
			var customTags = instance.Tags.filter(function(obj) {
			    return (obj.Key != "Name");
			});
			var htmlTags = "";
			if(customTags.length>0)
			{
		    	for(i=0;i < customTags.length;i++)
		    	{
		    		htmlTags +=   customTags[i].Key + ": " + customTags[i].Value + "<br>";
		    	}
			}
			
	    	return htmlTags;
		},
		"targets" : 3
	},
	{
		"data": "InstanceType",
		"defaultContent": "<i>Not set</i>",
		"targets" : 4 // InstanceType
	},
	{
		"data": "State",
		"defaultContent": "<i>Not set</i>",
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
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 6 // PrivateDnsName
	},
	{
		"data": "PublicDnsName",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 7 // PublicDnsName
	},
	{
		"data": "StateTransitionReason",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 8 // StateTransitionReason
	},
	{
		"data": "KeyName",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 9 // KeyName
	},
	{
		"data": "AmiLaunchIndex",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 10 // AmiLaunchIndex
	},
	{
		"data": "ProductCodes",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 11 // ProductCodes
	},
	{
		"data": "LaunchTime",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 12 // LaunchTime
	},
	{
		"data": "Placement",
		"defaultContent": "<i>Not set</i>",
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
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 15 // Monitoring
	},
	{
		"data": "SubnetId",
		"defaultContent": "<i>Not set</i>",	
	    "visible": false,
		"targets" : 16 // SubnetId
	},
	{
		"data": "VpcId",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 17 // VpcId
	},
	{
		"data": "StateReason",
		"defaultContent": "",
		"defaultContent": "",
	    "visible": false,
		"targets" : 18 // StateReason
	}
	,
	{
		"data": "Architecture",
		"defaultContent": "",
	    "visible": false,
		"targets" : 19 // Architecture
	}
	,
	{
		"data": "RootDeviceType",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 20 // RootDeviceType
	}
	,
	{
		"data": "RootDeviceName",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 21 // RootDeviceName
	}
	,
	{
		"data": "BlockDeviceMappings",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 22 // BlockDeviceMappings
	}
	,
	{
		"data": "VirtualizationType",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 23 // VirtualizationType
	}
	,
	{
		"data": "ClientToken",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 24 // ClientToken
	},
	{
		"data": "SecurityGroups",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 25 // SecurityGroups
	},
	{
		"data": "SourceDestCheck",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 26 // SourceDestCheck
	},
	{
		"data": "Hypervisor",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 27 // Hypervisor
	},
	{
		"data": "NetworkInterfaces",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 28 // NetworkInterfaces
	},
	{
		"data": "EbsOptimized",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 29 // EbsOptimized
	},
	{
		"data": "ImageId",
		"defaultContent": "<i>Not set</i>",
	    "visible": false,
		"targets" : 30 // ImageId
	},
	{
		"data": "",
		"defaultContent": "<i>Not set</i>",
		"orderable": false, 
	    "render": function(data, type, row) {
			var instanceID = row.InstanceId;
			return "<img src=\"../images/refresh.png\" class=\"img_refresh_instance\" title=\"Refresh this instance\" id=\"refresh_instance_"+instanceID+"\">";
	    },	    	
		"targets" : 31 // Refresh icon
	}
];