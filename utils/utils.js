const execa = require('execa');
const crypto = require('crypto');
const path = require('path');
const requestNative = require('request-promise-native');

const CURRENT_PATH = process.cwd();

// 时间补0操作
const addZero = (number) => {
    return number < 10 ? '0' + number : number;
};

/**
 * 发送消息至企业微信
 */
exports.sendMsgToQyWeChat = (access_token, params) => {
    return requestNative({
        url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=' + access_token,
        method: 'post',
        json: { ...params },
    });
};

/**
 * 获取当前完整时间
 */
exports.getCompleteTime = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${addZero(
        date.getHours(),
    )}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
};

/**
 * 获取当前版本分支
 */
exports.getGitBranch = () => {
    const res = execa.commandSync('git rev-parse --abbrev-ref HEAD');
    return res.stdout;
};

/**
 * 获取MD5
 */
exports.getMd5Code = (str) => {
    const md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex');
};

/**
 * 获取当前GIT账户用户名
 */
exports.getGitUserName = () => {
    const user = execa.commandSync('git config user.name');
    return user.stdout;
};

/**
 * 获取生成二维码的本地路径
 */
exports.getCurrentQrCodePath = (imagePath) => {
    const tempDirPath = path.resolve(CURRENT_PATH, './temp');
    const qrcodePath = path.resolve(tempDirPath, imagePath);
    return qrcodePath;
};

/**
 * 获取最近一次git提交记录
 */
exports.getLatestGitCommitMsg = () => {
    const { stdout } = execa.commandSync('git rev-parse --abbrev-ref HEAD');
    const command = execa.commandSync(`git log -1 ${stdout} HEAD --grep feat --pretty=format:%s`);
    return command.stdout;
};

/**
 * 获取指定范围的随机整数
 */

exports.getRandomIntNum = (min, max) => { 
    return Math.floor(Math.random() * (min - max) + max)
}
