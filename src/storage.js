import { Logger } from '@beautywe/core';
import packageInfo from '../package.json';

const logger = new Logger({ prefix: 'plugin-storage' });

/**
 * @param {*} options.expire - 缓存过期时间
 * @param {*} options.appVersion - 缓存的指定适用应用版本号
 */
module.exports = function storage(options) {
    const globalOpt = Object.assign({ expire: 7 }, options);

    return {
        name: 'storage',
        npmName: packageInfo.name,
        version: packageInfo.version,

        customMethod: {

            /**
             * 获取缓存
             * @param {*} key - 缓存名
             * @param {*} funOpt.expire - 是否忽略过期时间校验
             * @param {*} funOpt.appVersion - 缓存的指定适用应用版本号
             */
            set(key, value, funOpt) {
                try {
                    const _opt = Object.assign({}, globalOpt, funOpt);
                    const data = {
                        value,
                        expire: Date.now() + (_opt.expire * 24 * 3600 * 1000),
                    };

                    if (_opt.appVersion) data.version = _opt.appVersion;
                    wx.setStorageSync(key, data);
                } catch (e) {
                    logger.error(e);
                }
            },

            /**
             * 设置缓存
             * @param {*} key - 缓存名
             * @param {*} funOpt.ignoreVersion - 是否忽略版本校验
             * @param {*} funOpt.ignoreExpire - 是否忽略过期时间校验
             * @param {*} funOpt.appVersion - 缓存的指定适用应用版本号
             */
            get(key, funOpt) {
                try {
                    const data = wx.getStorageSync(key);
                    const _opt = Object.assign({ ignoreVersion: false, ignoreExpire: false }, globalOpt, funOpt);

                    // 校验数据存在性
                    if (!data) {
                        logger.debug(`key:${key} 数据不存在`, { key, data });
                        return undefined;
                    }

                    // 校验版本号
                    if (!_opt.ignoreVersion && _opt.appVersion && data.version !== _opt.appVersion) {
                        logger.debug(`key:${key} 校验版本号失败`, { key, data });
                        return undefined;
                    }

                    // 校验过期时间
                    if (!_opt.ignoreExpire && data.expire <= Date.now()) {
                        logger.debug(`key:${key} 校验有效时间失败`, { key, data });
                        return undefined;
                    }

                    return data.value;          
                } catch (e) {
                    logger.error(e);
                }
            },
            remove(key) {
                try {
                    wx.removeStorageSync(key);
                } catch (e) {
                    logger.error(e);
                }
            },
            clear() {
                try {
                    wx.clearStorageSync();
                } catch (e) {
                    logger.error(e);
                }
            },
        },
    };
};