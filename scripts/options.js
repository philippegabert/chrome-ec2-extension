var pp = "N:#;7!T]$\'nugb{(";

function save_options() {
	var default_region = $("#ec2_regions").val();
	var accessKeyId = $("#accessKeyId").val();
	var secretAccessKey = $("#secretAccessKey").val();
	var intervalFetchRunning = $("#intervalFetchRunning").val();
	var _0xb95e = ["encrypt", "AES"];
	accessKeyId = CryptoJS[_0xb95e[1]][_0xb95e[0]](accessKeyId, pp);
	secretAccessKey = CryptoJS[_0xb95e[1]][_0xb95e[0]](secretAccessKey, pp)

	chrome.storage.sync.set({
		default_region : default_region,
		accessKeyId : accessKeyId,
		secretAccessKey : secretAccessKey,
		intervalFetchRunning: intervalFetchRunning
	}, function() {
		// Update status to let user know options were saved.
		$("#status").css("color", "#000000").text('Options saved.');
		setTimeout(function() {
			$("#status").text('');
		}, 1000);
	});
}

function set_option_page()
{
	restore_options();
	$("#save").click(function() {
    	save_options();
    })
    $("#chk_options").click(function() {
    	chk_options();
    })
}

function chk_options()
{
	$("#loading_pic").show();
	var creds = new AWS.Credentials({
		  accessKeyId: $("#accessKeyId").val(),
		  secretAccessKey: $("#secretAccessKey").val()
	});
	AWS.config.credentials = creds;
	var iam = new AWS.IAM();
	iam.getUser({}, function(err, data) {
		if (err)
		{
			console.error("[EC2Mgt] An error occured while fetching account details ["+err.toString()+"]");
			$("#status").css("color", "#FF0000");
			$("#status").html("Error ! An error occured while fetching account details ["+err.toString()+"]");
			$("#loading_pic").hide();
		}
		else
		{
			console.log("[EC2Mgt] User information successfully fetched. ["+data.User.UserId + " / "+data.User.UserName+"]");
			$("#status").css("color", "#00CC00");
			$("#status").html("Yup, it works ! <br>Account ID: <b>"+data.User.UserId + "</b><br>Account User name: <b>"+data.User.UserName+ "</b>");
			$("#loading_pic").hide();
		}
	});
}

function restore_options() {
	chrome.storage.sync.get({
		default_region : 'eu-west-1',
		accessKeyId: '',
		secretAccessKey: '',
		intervalFetchRunning: 30
	}, function(items) {
		$("#ec2_regions").val(items.default_region);
		$("#intervalFetchRunning").val(items.intervalFetchRunning);
		$("#ec2_regions").niceSelect();
		var _0xf911 = ["enc", "accessKeyId", "decrypt", "AES", "val", "#accessKeyId", "secretAccessKey", "#secretAccessKey"];
		$(_0xf911[5])[_0xf911[4]](CryptoJS[_0xf911[3]][_0xf911[2]](items[_0xf911[1]], pp).toString(CryptoJS[_0xf911[0]].Utf8));
		$(_0xf911[7])[_0xf911[4]](CryptoJS[_0xf911[3]][_0xf911[2]](items[_0xf911[6]], pp).toString(CryptoJS[_0xf911[0]].Utf8))
	});
}

document.addEventListener('DOMContentLoaded', set_option_page);
