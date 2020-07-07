var log = org.apache.log4j.Logger.getLogger('DVWAAuthScript');

function authenticate(helper, paramsValues, credentials) {
    log.info("DVWA Auth authenticate() executed");
    var loginUrl = paramsValues.get("Login URL");
    log.info("loginUrl:"+loginUrl);
    var csrfTokenName = paramsValues.get("CSRF Field");
    log.info("csrfTokenName:"+csrfTokenName);
    var csrfTokenValue = extractInputFieldValue(getPageContent(helper, loginUrl), csrfTokenName);
    log.info("csrfTokenValue:"+csrfTokenValue);
    var postData = paramsValues.get("POST Data");
    postData = postData.replace('{%username%}', encodeURIComponent(credentials.getParam("Username")));
    postData = postData.replace('{%password%}', encodeURIComponent(credentials.getParam("Password")));
    postData = postData.replace('{%' + csrfTokenName + '%}', encodeURIComponent(csrfTokenValue));
    log.info("postData:"+postData);
    var msg = sendAndReceive(helper, loginUrl, postData);
    log.info("msg.getResponseHeader():"+msg.getResponseHeader());
    return msg;
}
function getRequiredParamsNames() {
    return [ "Login URL", "CSRF Field", "POST Data" ];
}
function getOptionalParamsNames() {
    return [];
}
function getCredentialsParamsNames() {
    return [ "Username", "Password" ];
}
function getPageContent(helper, url) {
    var msg = sendAndReceive(helper, url);
    return msg.getResponseBody().toString();
}
function sendAndReceive(helper, url, postData) {	
    var msg = helper.prepareMessage();
    var method = "GET";
    if (postData) {
        method = "POST";
        msg.setRequestBody(postData);
    }
    var requestUri = new org.apache.commons.httpclient.URI(url, true);
    var requestHeader = new org.parosproxy.paros.network.HttpRequestHeader(method, requestUri, "HTTP/1.0");
    msg.setRequestHeader(requestHeader);
    helper.sendAndReceive(msg);
    return msg;
}
function extractInputFieldValue(page, fieldName) {
	// Rhino:
	//var src = new net.htmlparser.jericho.Source(page);
	// Nashorn:
    var Source = Java.type("net.htmlparser.jericho.Source");
    var src = new Source(page);
    var it = src.getAllElements('input').iterator();
    while (it.hasNext()) {
        var element = it.next();
        if (element.getAttributeValue('name') == fieldName) {
            return element.getAttributeValue('value');
        }
    }
    return '';
}

function getLoggedInIndicator() {
	return "\\Q<a href=\"logout.php\">Logout</a>\\E"
}

function getLoggedOutIndicator() {
	return "(?:Location: [./]*login\\.php)|(?:\\Q<form action=\"login.php\" method=\"post\">\\E)"
}