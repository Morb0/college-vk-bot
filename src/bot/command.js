"use strict";
exports.__esModule = true;
var Command = /** @class */ (function () {
    function Command(name, aliases) {
        this.name = name;
        this.aliases = aliases;
    }
    Command.prototype.getName = function () {
        return this.name;
    };
    Command.prototype.getAliases = function () {
        return this.aliases;
    };
    return Command;
}());
exports.Command = Command;
