import { BtApp } from '@beautywe/core';
import test from 'ava';
import storage from '../src/storage';

let cache = {};
let wxInstance;
const appInfoMock = {
    version: '0.0.1',
    name: 'mockAppInfo',
    appid: '123',
};

function newAppUseingPlugin(storageOpt){
    const app = new BtApp();
    const plugin = storage(storageOpt);
    app.use(plugin);
    app.onLaunch();
    return { app, plugin };
}

test.beforeEach(() => {
    // mock wx storage
    wxInstance = global.wx;
    global.wx = {
        setStorageSync: (key, value) => { cache[key] = value; },
        getStorageSync: key => cache[key],
        removeStorageSync: key => delete cache[key],
        clearStorageSync: () => { cache = {}; },
    };
});

test.afterEach(() => {
    global.wx = wxInstance;
    cache = {};
});


test('use plugin', (t) => {
    const { app, plugin } = newAppUseingPlugin();
    t.is(app._btPlugin.plugins[0].name, plugin.name);
    t.truthy(app[`${plugin.name}`]);
});

test('set & get & remove & clear', (t) => {
    const { app } = newAppUseingPlugin();
    app.storage.set('name', 'jc');
    app.storage.set('age', '18');

    t.is(app.storage.get('name'), 'jc');
    t.is(app.storage.get('age'), '18');

    app.storage.remove('name');
    t.is(app.storage.get('name'), undefined);
    t.is(app.storage.get('age'), '18');

});

test('clear', (t) => {
    const { app } = newAppUseingPlugin();
    app.storage.set('name', 'jc');
    app.storage.set('age', '18');

    t.is(app.storage.get('name'), 'jc');
    t.is(app.storage.get('age'), '18');

    app.storage.clear('name');
    t.is(app.storage.get('name'), undefined);
    t.is(app.storage.get('age'), undefined);
});

test('version check', (t) => {
    const { app: app1 } = newAppUseingPlugin({ appVersion: '0.0.1' });
    const { app: app2 } = newAppUseingPlugin({ appVersion: '0.0.1' });
    const { app: app3 } = newAppUseingPlugin({ appVersion: '0.0.2' });

    app1.storage.set('name', 'jc');
    t.is(app1.storage.get('name'), 'jc');

    t.is(app2.storage.get('name'), 'jc');

    // update version
    t.is(app3.storage.get('name'), undefined);
});

test.cb('expire check', (t) => {
    const { app } = newAppUseingPlugin({
        // 过期时间 1s
        expire: 1000 / (24 * 3600 * 1000),
    });

    app.storage.set('name', 'jc');
    t.is(app.storage.get('name'), 'jc');

    setTimeout(() => {
        t.is(app.storage.get('name'), undefined);        
        t.end();
    }, 1000);
    
});

test('options.ignoreVersion', (t) => {
    const { app: app1 } = newAppUseingPlugin({ appVersion: '0.0.1' });
    const { app: app2 } = newAppUseingPlugin({ appVersion: '0.0.2' });

    app1.storage.set('name', 'jc', );
    t.is(app1.storage.get('name'), 'jc');

    // update version
    t.is(app2.storage.get('name'), undefined);
    t.is(app2.storage.get('name', {
        ignoreVersion: true,
    }), 'jc');
});

test('no version on created', (t) => {
    const { app: app1 } = newAppUseingPlugin();
    const { app: app2 } = newAppUseingPlugin({ appVersion: '0.0.2' });

    app1.storage.set('name', 'jc', );
    t.is(app1.storage.get('name'), 'jc');

    // update version
    t.is(app2.storage.get('name'), undefined);
});

test('throw err', (t) => {
    const error = new Error('test error');
    global.wx = {
        setStorageSync: () => { throw error; },
        getStorageSync: () => { throw error; },
        removeStorageSync: () => { throw error; },
        clearStorageSync: () => { throw error; },
    };

    const { app } = newAppUseingPlugin(appInfoMock);
    app.storage.set('name', 'jc');
    app.storage.get('name', 'jc');
    app.storage.remove('name', 'jc');
    app.storage.clear('name', 'jc');
    t.pass();
});