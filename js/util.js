function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getQueryParam(variable, defaultValue) {
  var query = location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return defaultValue || false;
}

function animateRed(nodeToGlow){
	nodeToGlow
        .animate({'background-color':'#FF8F86'},200)
        .animate({'background-color':'#FFFAED'},200)
        .animate({'background-color':'#FF8F86'},200)
        .animate({'background-color':'#FFFAED'},200)
        .animate({'background-color':'#FF8F86'},200)
        .animate({'background-color':'#FFFAED'},200);
}

function animateGreen(nodeToGlow){
	nodeToGlow
        .animate({'background-color':'#E3F5B6'},200)
        .animate({'background-color':'#FFFAED'},200)
        .animate({'background-color':'#E3F5B6'},200)
        .animate({'background-color':'#FFFAED'},200);

}