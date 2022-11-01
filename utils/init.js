const path = require('path');
const ci = require('miniprogram-ci');
const fs = require('fs-extra');
const CURRENT_PATH = process.cwd();
const configs = path.resolve(CURRENT_PATH, './ci.config.json');
if (!fs.existsSync(configs)) { 
    console.log(chalk.red('当前目录下未找到ci.config.json文件！'));
}
const { appId, privateKeyPath, projectPath } = require(configs);

// 项目文件初始化
const project = new ci.Project({
    appid: appId, //你的APPID
    type: 'miniProgram',
    projectPath, //项目路径
    privateKeyPath: privateKeyPath, //私钥的路径
    ignores: ['node_modules/**/*'],
});

module.exports = project;