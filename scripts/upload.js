const ci = require('miniprogram-ci');
const path = require('path');
const project = require('../utils/init');
const { notificationToQyWeChat } = require('../utils/api');
const { getRandomIntNum, getCurrentQrCodePath, getLatestGitCommitMsg } = require('../utils/utils');
const CURRENT_PATH = process.cwd();

module.exports = async (value) => {
    try {
        const configs = path.resolve(CURRENT_PATH, './ci.config.json');
        const packagePath = path.resolve(CURRENT_PATH, './package.json');
        const { enable } = require(configs);
        const { version } = require(packagePath);
        // 判断是否命令行参数携带release，如果没有，则随机“派遣”一个机器人去上传代码
        const robot = !value ? getRandomIntNum(2, 20) : 1;
        const uploadQrcodePath = getCurrentQrCodePath('./upload.jpg');
        await ci.upload({
            project,
            version: version,
            desc: getLatestGitCommitMsg(),
            robot,
            setting: {
                es6: true,
                minifyJS: true,
                minifyWXML: true,
                minifyWXSS: true,
                autoPrefixWXSS: true
            },
        });
        // 配置了可发送消息并且为体验版的时候，才发送通知
        if (enable && value) {
            notificationToQyWeChat(uploadQrcodePath, 'upload', getLatestGitCommitMsg());
        }
    } catch (err) { 
        throw new Error(err);
    }
}