import i18n from '../lib/i18n';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import {DDP} from 'meteor/ddp';

const _localesPerConnections = {};
Meteor.onConnection(conn => {
    _localesPerConnections[conn.id] = '';
    conn.onClose(() => delete _localesPerConnections[conn.id]);
});
const _publishConnectionId = new Meteor.EnvironmentVariable();
i18n._getConnectionId = (connection = null) => {
    let connectionId = connection && connection.id;
    try {
        const invocation = DDP._CurrentInvocation.get();
        connectionId = invocation && invocation.connection && invocation.connection.id;
        if (!connectionId) {
            connectionId = _publishConnectionId.get();
        }
    } catch (e) {
        //Outside of fibers we cannot detect connection id
    }
    return connectionId;
};

i18n._getConnectionLocale = (connection = null) => _localesPerConnections[i18n._getConnectionId(connection)];

function patchPublish (_publish) {
    return function (name, func, ...others) {
        return _publish.call(this, name, function (...args) {
            const context = this;
            return _publishConnectionId.withValue(context && context.connection && context.connection.id, function () {
                return func.apply(context, args);
            });
        }, ...others);
    };
}

i18n.setLocaleOnConnection = (locale, connectionId = i18n._getConnectionLocale()) => {
    if (typeof _localesPerConnections[connectionId] === 'string') {
        _localesPerConnections[connectionId] = i18n.normalize(locale);
        return;
    }
    throw new Error ('There is no connection under id: ' + connectionId);
};

Meteor.methods({
    'universe.i18n.setServerLocaleForConnection' (locale) {
        check(locale, Match.Any);
        if (typeof locale !== 'string' || !i18n.options.sameLocaleOnServerConnection) {
            return;
        }
        const connId = i18n._getConnectionId(this.connection);
        if (!connId) {
            return;
        }
        i18n.setLocaleOnConnection(locale, connId);
    }
});

Meteor.publish = patchPublish (Meteor.publish);
Meteor.server.publish = patchPublish (Meteor.server.publish);
