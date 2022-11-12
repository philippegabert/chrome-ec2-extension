

function get_lim(callBack)
{
	callBack(timil);
}

function check_number_of_calls()
{
	return parseInt((localStorage["usage_count"] != undefined ? localStorage["usage_count"] : 0));
}
function chk_license_lim_search(callBackFunction)
{
	if(chck_license())
	{
		callBackFunction(true);
	}
	else
	{
		get_lim(function(limit){
			var under_limit = (check_number_of_calls() < limit);
			callBackFunction(under_limit);
		});
	}
}

function chck_license()
{
	if(localStorage["license_type"] == debug_flag) 
	{
		console.log("license from local storage");
		if(!localStorage["license_sync"]) {
			chrome.storage.sync.get(['license_type'], function(result) {
				if(result.license_type != localStorage["license_type"])
				{
					console.log('Value was set locally but not synced');
					chrome.storage.sync.set({license_type: debug_flag, transaction_id: localStorage["premium_orderid"]}, function() {
						localStorage["license_sync"] = true;
					  });
				}
			  });
		}
		return true;
	}
	else {
		console.log("Local storage not set. Checking sync storage");
		chrome.storage.sync.get(['license_type'], function(result) {
			localStorage["license_type"] = result.license_type;
			localStorage["license_sync"] = true;
			return result.license_type == debug_flag;
		  });
	}
	return false;
}

function paypal_buttons()
{
	paypal.Buttons({
			style: {
				color:  'gold',
				shape:  'pill',
				label:  'pay',
				height: 25
			},
	    createOrder: function(data, actions) {
	      return actions.order.create({
	        purchase_units: [{
	          amount: {
	            value: atob(unknown_value) // Don't be silly... no real better way to hide...
	          }
	        }],
			shipping_preference: "NO_SHIPPING"
	      });
	    },
	    onApprove: function(data, actions) {
	      return actions.order.capture().then(function(details) {
			console.log(details);
	       
			var trns_id = details.purchase_units[0].payments.captures[0].id;//details.id;
			
			var trns_type = debug_flag;

			localStorage["license_type"] = trns_type;
			localStorage["premium_orderid"] = trns_id;
			chrome.storage.sync.set({license_type: trns_type, transaction_id: trns_id, transaction_details: details}, function() {
			  localStorage["license_sync"] = true;
			  chrome.tabs.reload(function(){});
			});
	      });
	    }
	  }).render('#paypal-button-container');
}

function increment_number_of_calls()
{
	localStorage["usage_count"] = parseInt(parseInt((localStorage["usage_count"] != undefined ? localStorage["usage_count"] : 0)) + 1);
	return check_number_of_calls();
}
function get_usage_count()
{
	var date = new Date();
	date = (date.getDate() < 9 ? '0':'')+ date.getDate() +'/'+(date.getMonth()+1 < 9 ? '0':'')+(date.getMonth()+1)+'/'+date.getFullYear();
	
	var last_usage_date = date;
	
	if(localStorage["last_usage_date"] == last_usage_date) // The add-on was already used today
	{
		return parseInt(localStorage["usage_count"]);
	}
	else
	{
		localStorage["last_usage_date"] = last_usage_date;
		localStorage["usage_count"] = parseInt("0");
		return 0;
	}
}

function display_limit_usage()
{
	$("#fieldsetResults").show();
	$("#tmpMessageVersion").hide();
	$("#nav_buttons_container").hide();
	
	get_lim(function(limit){
		$("#resultat").html(
				$('<div>').attr("id","alert_message_lic").attr("class","div_alert").css("font-size","14px").css("font-weight", "bold")
						   .html("You've reached the limit of "+limit+" searches per day."))
						   .append($("<br>"));
	});
	
	
	$("#features_unlock").show();
	paypal_buttons();
}