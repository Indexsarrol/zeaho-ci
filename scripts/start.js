const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ci = require('miniprogram-ci');
const CURRENT_PATH = process.cwd();
const {
    getMd5Code,
    getGitBranch,
    getGitUserName,
    getCompleteTime,
    sendMsgToQyWeChat,
    getCurrentQrCodePath,
} = require('../utils');

const run = async () => {
    const configs = path.resolve(CURRENT_PATH, './ci.config.json');
    if (!fs.existsSync(configs)) { 
        console.log(chalk.red('当前目录下未找到ci.config.json文件！'));
    }
    const {
        enable,
        access_token,
        appId,
        privateKeyPath,
        projectPath,
        project_name,
        notification_list,
    } = require(configs);

    const ACCESS_TOKEN = access_token;

    

    /**
     * 1. FIXME:显示是版本还是线上bug 版本的话显示版本号，线上bug显示bug单号
     * 2. FIXME:判断如果是bug单号版本号需要手动输入，如果是版本号就作为版本号问题的默认答案
     * 3. FIXME:项目描述信息默认为格式为：提交人——提交时间，可以手动输入
     * 4. FIXME: bug单号可以直接跳转至对应jira单页面
     * 5. FIXME:如果是线上问题，展示问题单号，jira链接，如果是版本迭代，展示版本号即可
     * 6. TODO:选择以那个机器人提交，机器人1默认为体验版，如果选择的是其他机器人，则不用往企业微信里发通知
     */

    // 项目文件初始化
    const project = new ci.Project({
        appid: appId, //你的APPID
        type: 'miniProgram',
        projectPath, //项目路径
        privateKeyPath: privateKeyPath, //私钥的路径
        ignores: ['node_modules/**/*'],
    });

    // 上传
    const upload = async ({ TYPE, VERSION, DESCRIPTION, IS_RELEASE }) => {
        const uploadQrcodePath = getCurrentQrCodePath('./upload.jpg');
        await ci.upload({
            project,
            version: VERSION,
            desc: DESCRIPTION,
            robot: IS_RELEASE ? 1 : 2,
            setting: {
                es6: true,
            },
        });
        // 配置了可发送消息并且为体验版的时候，才发送通知
        if (enable && IS_RELEASE) {
            notificationToQyWeChat(uploadQrcodePath, TYPE);
        }
    };

    // 预览
    const preview = async (type) => {
        // 是否存在temp文件夹, 如果不存在动态创建temp文件夹，用于存储二维码图片
        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('temp');
        }
        const previewQrcodePath = getCurrentQrCodePath('./preview.jpg');
        await ci.preview({
            project,
            setting: { es6: true },
            qrcodeFormat: 'image',
            qrcodeOutputDest: previewQrcodePath,
        });
        if (enable) {
            notificationToQyWeChat(previewQrcodePath, type);
        }
    };

    // 问题询问
    const askQuestions = () => {
        const currentBranch = getGitBranch().split('/')[1];
        const questions = [
            {
                name: 'TYPE',
                type: 'list',
                choices: ['preview', 'upload'],
                message: '请选择您需要的操作？',
            },
            {
                name: 'VERSION',
                type: 'input',
                when(answers) {
                    return answers.TYPE === 'upload';
                },
                message: '请输入您要发布的版本号?',
                suffix: '(如果是线上问题，请依据线上版本号重新填写版本号)',
                default: currentBranch,
                validate: (answers) => {
                    const pattern = /^\d+(\.\d+)+$/;
                    if (!pattern.test(answers)) {
                        console.log(chalk.red('请输入正确的版本号！'));
                        return;
                    }
                    return true;
                },
            },
            {
                name: 'DESCRIPTION',
                type: 'input',
                when(answers) {
                    return answers.TYPE === 'upload';
                },
                message: '请输入您的版本描述信息？',
                default: `${getGitUserName() || 'ci机器人'} ${getCompleteTime()}提交`,
            },
            {
                name: 'IS_RELEASE',
                type: 'confirm',
                when(answers) {
                    return answers.TYPE === 'upload';
                },
                message: '是否选择当前版本作为体验版本？',
                suffix: '(如果已经有人设置了体验版，则该项不生效)',
            },
        ];
        return inquirer.prompt(questions);
    };

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
    const mentioned = async (type) => {
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
                    }</font> \n版本描述: <font color=\"comment\">${
                        getGitUserName() || '机器人CI'
                    } ${getCompleteTime()}提交</font>\n接收人: <font color=\"comment\">${notification_list.map(
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
    const notificationToQyWeChat = async (qrcodePath, type) => {
        await sendQrcodeMsg(qrcodePath);
        await mentioned(type);
    };

    // 入口函数
    const answers = await askQuestions();
    const { TYPE, VERSION, DESCRIPTION, IS_RELEASE } = answers;
    if (TYPE === 'preview') {
        preview(TYPE);
    } else {
        upload({ TYPE, VERSION, DESCRIPTION, IS_RELEASE });
    }
    
}

module.exports = run


