const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const CURRENT_PATH = process.cwd();
const {
    getMd5Code,
    getGitBranch,
    getGitUserName,
    getCompleteTime,
    sendMsgToQyWeChat,
} = require('../utils/utils');

const configs = path.resolve(CURRENT_PATH, './ci.config.json');
const { access_token, project_name, notification_list } = require(configs);
const ACCESS_TOKEN = access_token;

// 发送二维码至企业微信
const sendQrcodeMsg = async (codePath) => {
    try {
        const bitmap = await fs.readFile(codePath);
        const base64 = Buffer.from(bitmap, 'binary').toString('base64');
        const imgMd5 = getMd5Code(bitmap);
        const params = {
            msgtype: 'image',
            image: {
                base64: base64,
                md5: imgMd5,
            },
        };
        const res = await sendMsgToQyWeChat(ACCESS_TOKEN, params);
        if (res.errcode === 0) {
            console.log(chalk.green('发送企业微信二维码图片成功!'));
        }
    } catch (e) {
        console.error(chalk.red('发送企业微信二维码图片失败!'));
    }
};

// 发送消息至企业微信
const mentioned = async (type, desc) => {
    try {
        const currentBranch = await getGitBranch().split('/')[1];
        const isRelease = type === 'preview' ? '开发版' : '体验版';
        const pattern = /^([1-9]\d|[1-9])(\.([1-9]\d|\d)){2}$/;
        const isOnlineQs = !pattern.test(currentBranch); // 根据分支名判断是否为线上问题还是版本迭代
        const params = {
            msgtype: 'markdown',
            markdown: {
                content: `<font color='warning'>${project_name}</font>小程序<font color="info">${isRelease}</font>已发布！\n版本类型: <font color=\"warning\">${
                    isOnlineQs ? '线上问题' : '版本迭代'
                }</font> \n${isOnlineQs ? '问题单号' : '当前版本'}: <font color=\"comment\"> ${
                    isOnlineQs
                        ? `[${currentBranch}](https://jira.zeaho.com/browse/${currentBranch})`
                        : currentBranch
                }</font> \n版本描述: <font color=\"comment\">${desc || ((getGitUserName() || '机器人CI') + getCompleteTime())}</font>\n接收人: <font color=\"comment\">${notification_list.map(
                    (item) => `<@${item}>`,
                )}</font>`,
            },
        };
        const res = await sendMsgToQyWeChat(ACCESS_TOKEN, params);
        if (res.errcode === 0) {
            console.log(chalk.green('发送通知消息成功!'));
        }
    } catch (e) {
        console.error(chalk.red(`发送通知消息失败!`));
    }
};

// 综合上述两种方法
exports.notificationToQyWeChat = async (qrcodePath, type, desc) => {
    await sendQrcodeMsg(qrcodePath);
    await mentioned(type, desc);
};