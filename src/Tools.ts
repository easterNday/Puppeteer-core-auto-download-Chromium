import * as fs from 'fs';
import * as vscode from 'vscode';

const statusBarTimeout = 10000;

export { isExistsPath, showErrorMessage, getChromiunInfo, installChromium };


// 判断文件夹是否存在
function isExistsPath(path: string) {
    if (path.length === 0) {
        return false;
    }
    try {
        fs.accessSync(path);
        return true;
    } catch (error: any) {
        console.warn(error.message);
        return false;
    }
}

// 输出错误信息
function showErrorMessage(msg: string, error: any) {
    vscode.window.showErrorMessage('ERROR: ' + msg);
    console.log('ERROR: ' + msg);
    if (error) {
        vscode.window.showErrorMessage(error.toString());
        console.log(error);
    }
}

// 获取版本平台信息
function getChromiunInfo() {
    const regExp = /.local-chromium\\(mac|win32|win64|linux)-(\d+)\\/g;
    var info = regExp.exec(require('puppeteer-core').executablePath());
    if (info) {
        info[0] = require('puppeteer-core').executablePath();
    }
    return info;
}

// 安装浏览器
async function installChromium(platform: string, revision: string) {
    const puppeteer = require('puppeteer-core');
    //信息显示
    vscode.window.showInformationMessage('正在安装 Chromium ...');
    var statusbarmessage = vscode.window.setStatusBarMessage('正在安装 Chromium ...', statusBarTimeout);
    //正式安装
    try {
        const browserFetcher = puppeteer.createBrowserFetcher();        //下载机创建
        const revisionInfo = browserFetcher.revisionInfo(revision);     //获取版本信息，TODO:根据这个也许可以写得更严谨
        //开始下载
        browserFetcher.download(revisionInfo.revision, onProgress).
            then(() => browserFetcher.localRevisions())
            .then(onSuccess)
            .catch(onError);

        //成功时候的调用函数
        function onSuccess(localRevisions: any) {
            statusbarmessage.dispose();
            console.log(`Chromium 被安装到 ${revisionInfo.folderPath}`);
            localRevisions = localRevisions.filter((revision: any) => revision !== revisionInfo.revision);
            // 删除其他版本
            const cleanupOldVersions = localRevisions.map((revision: any) => browserFetcher.remove(revision));
            Promise.all(cleanupOldVersions);
            vscode.window.showInformationMessage('成功安装 Chromium !');
        }

        //失败时候的调用函数
        function onError(error: any) {
            statusbarmessage.dispose();
            vscode.window.setStatusBarMessage('ERROR: 安装 Chromium 失败！', statusBarTimeout);
        }

        //进度条展示
        function onProgress(downloadedBytes: number, totalBytes: number) {
            var progress = Math.floor(downloadedBytes / totalBytes * 100);
            vscode.window.setStatusBarMessage('安装 Chromium 进度：' + progress + '%', statusBarTimeout);
        }
    } catch (error) {
        showErrorMessage('installChromiuparseInt()', error);
    }
}