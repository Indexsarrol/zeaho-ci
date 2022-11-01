const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ci = require('miniprogram-ci');

const project = require('../utils/init');
const { getLatestGitCommitMsg } = require('../utils/utils');
const { notificationToQyWeChat } = require('../utils/api');
const { getCurrentQrCodePath } = require('../utils/utils');

const CURRENT_PATH = process.cwd();
const configs = path.resolve(CURRENT_PATH, './ci.config.json');

module.exports = async () => { 
    if (!fs.existsSync(configs)) { 
        console.log(chalk.red('当前目录下未找到ci.config.json文件！'));
        return;
    }
    // 是否存在temp文件夹, 如果不存在动态创建temp文件夹，用于存储二维码图片
    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('temp');
    }
    const { enable } = require(configs);
    const previewQrcodePath = getCurrentQrCodePath('./preview.jpg');
    const commitMsg = getLatestGitCommitMsg();
    await ci.preview({
        project,
        setting: {
            es6: true,
            minifyJS: true,
            minifyWXML: true,
            minifyWXSS: true,
            autoPrefixWXSS: true
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: previewQrcodePath,
    });
    if (enable) {
        notificationToQyWeChat(previewQrcodePath, 'preview', commitMsg);
    }
}