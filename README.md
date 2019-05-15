# 介绍

[![CircleCI](https://img.shields.io/circleci/project/github/beautywe/plugin-storage/master.svg)](https://circleci.com/gh/beautywe/plugin-storage)
[![NPM Version](https://img.shields.io/npm/v/@beautywe/plugin-storage.svg)](https://www.npmjs.com/package/@beautywe/plugin-storage) 
[![NPM Downloads](https://img.shields.io/npm/dm/@beautywe/plugin-storage.svg)](https://www.npmjs.com/package/@beautywe/plugin-storage) 
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@beautywe/plugin-storage.svg) 
[![Coverage Status](https://coveralls.io/repos/github/beautywe/beautywe-plugin-storage/badge.svg)](https://coveralls.io/github/beautywe/beautywe-plugin-storage)

## Feature
1. 过期控制
2. 版本隔离

# 安装

```
$ npm i @beautywe/plugin-storage
```

```javascript
import { BtApp } from '@beautywe/core';
import storage from '@beautywe/plugin-storage';

const app = new BtApp();
app.use(storage({
    // options
}))
```

# 使用

```
app.storage.set(key, value, options);
app.storage.get(key, options);
app.storage.remove(key);
app.storage.clear();
```

## storage(options)

**options.expire**

设置缓存时间，默认是 7 ，单位是「天」

**options.appVersion**

设置当前应用的版本号，后续的所有缓存，都会关联到当前版本号中，并且会有版本隔离：

```javascript
app.use({ appVersion: '0.0.1' });
app.set('name', 'jc');

// 返回 jc
app.get('name');

// 当版本更新后
app.use({ appVersion: '0.0.2' });

// 返回 undefined;
app.get('name');
```

## set(key, value, options)

**key**

要设置的缓存名

**value**

要设置的缓存

**options.expire**

缓存的过期时间，默认跟 `stoarge(options)` 设置的一致。

**options.appVersion**

缓存的对应应用版本，默认跟 `storage(options)` 设置的一致。

## get(key, options)

**key**

获取的缓存名

**options.appVersion**

缓存的对应应用版本，默认跟 `storage(options)` 设置的一致。

**options.ignoreVersion**

是否忽略版本检查，默认为 `false`，设置为 `true` 时，则返回的缓存不做版本检查

**options.ignoreExpire**

是否忽略过期时间检查，默认为 `false`，设置为 `true` 时，则返回的缓存不做过期时间检查

## remove(key)

清除特定的缓存

## clear()

清除所有缓存

