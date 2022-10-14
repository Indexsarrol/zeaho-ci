/**
 * 1. 动态创建`temp`文件夹，用于存储体验版的二维码
 * 2. 初始化配置文件`ci.config.json`文件
 */
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
module.exports = async () => { 
    const CURRENT_PATH = process.cwd();
    const tempPath = path.resolve(CURRENT_PATH, './temp');
    const configFilePath = path.resolve(CURRENT_PATH, './ci.config.json');
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync('temp');
        console.log(chalk.green('[通知]：创建temp文件夹成功！'))
    }

    // 初始化配置文件`ci.config.json`文件
    if (!fs.existsSync(configFilePath)) { 
        const content = require('../ci.config.json')
        await fs.writeJSONSync(CURRENT_PATH + '/ci.config.json', content, { spaces: 4 });
        console.log(chalk.green('[通知]：创建ci.config.json成功！'))
    }

    if (fs.existsSync(tempPath) && fs.existsSync(configFilePath)) { 
        console.warn(chalk.yellow('[警告]：当前项目已经初始化完毕，请勿重复初始化！'))
    }
}
