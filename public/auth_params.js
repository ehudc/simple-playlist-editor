'use strict';
var AuthParams = (function() {
    var Constr = function() {};

    Constr.prototype = {
        constructor: AuthParams
    };

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    Constr.prototype.getHashParams = function() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    };


    return Constr;
}());

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = AuthParams;
}