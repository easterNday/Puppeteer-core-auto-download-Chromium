// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Tools from './Tools';

var chromiunInfo: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//环境准备初始化
	readerInit();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extention.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
	const puppeteer = require('puppeteer-core');
	context.subscriptions.push(vscode.commands.registerCommand('extention.show', async () => {

		(async () => {
			const browser = await puppeteer.launch(
				{ headless: false }
			);
			const page = await browser.newPage();
			await page.goto('https://www.baidu.com');
		})();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() { }

//插件环境初始化
function readerInit() {
	try {
		//获取浏览器信息
		chromiunInfo = Tools.getChromiunInfo();
		//如果不存在
		if (!Tools.isExistsPath(chromiunInfo[0])) {
			//安装
			Tools.installChromium(chromiunInfo[1], chromiunInfo[2]);
		}
		//更新配置
		vscode.workspace.getConfiguration().update("reader.executablePath", chromiunInfo[0]);
	} catch (error) {
		Tools.showErrorMessage('readerInit()', error);
	}
}