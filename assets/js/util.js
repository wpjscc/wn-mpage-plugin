function appendUrlParam(url, param) {
    Object.keys(param).forEach(function (paramName) { 
        if (url.indexOf(paramName + '=') === -1) {
            if (url.indexOf('?') === -1) {
                url += '?' + paramName + '=' + encodeURIComponent(param[paramName]);
            } else { 
                url += '&'+ paramName + '=' + encodeURIComponent(param[paramName]);
            }
        }
    })
    return url;
}