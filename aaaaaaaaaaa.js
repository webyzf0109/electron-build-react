const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const fs = require('fs')
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true
        }
    })
    // mainWindow.webContents.openDevTools();

    // 定义文件下载扩展名选择
    const extensionType = {
        // 图片
        images: [
            { name: '.jpg', extensions: ['jpg'] },
            { name: '.png', extensions: ['png'] },
            { name: '.gif', extensions: ['gif'] },
        ],
        // Excel
        excel: [
            { name: '.xlsx', extensions: ['xlsx'] },
            { name: '.xls', extensions: ['xls'] },
        ]
    }
    //在主线程下，通过ipcMain对象监听渲染线程传过来的saveDialog事件
    ipcMain.on('saveDialog', (event, arg) => {
        // 打开弹窗
        dialog.showSaveDialog(mainWindow, {
            // 在 Windows 和 Linux 上, 打开对话框不能同时是文件选择器和目录选择器, 因此如果在这些平台上将 properties 设置为["openFile"、"openDirectory"], 则将显示为目录选择器。
            properties: ['openFile', 'openDirectory'],
            // 默认情况下使用的绝对目录路径、绝对文件路径、文件名
            defaultPath: arg.fileName,
            // 文件下载扩展名
            filters: [
                ...extensionType[arg.fileType]
            ],
            // 点击保存回调
        },filePath => {
            // filePath存在则为保存路径 否为undefined
            // 去掉头部无用字段并将base64转码成buffer
            let dataBuffer = Buffer.from(arg.baseCode.split('base64,')[1], 'base64')
            // 检测文件扩展名是否正确
            let typeFlag = extensionType[arg.fileType].some(item => {
                if (filePath) {
                    return item.extensions[0] === filePath.substring(filePath.lastIndexOf('.') + 1)
                } else {
                    return false
                }
            })
            if (typeFlag) {
                fs.writeFile(filePath, dataBuffer, err => {
                    // 失败
                    if (err) {
                        // 向渲染进程发送消息通知失败
                        mainWindow.webContents.send('defeatedDialog')
                    }
                })
                // 成功 向渲染进程发送消息通知成功
                mainWindow.webContents.send('succeedDialog')
                // 判断是否存在保存路径
            } else if (filePath !== undefined) {
                dialog.showMessageBox({
                    type: 'error',
                    title: '系统提示',
                    message: '取消操作'
                })
            }
        })
    })


    const urlLocation = isDev ? "http://localhost:3000" : `aaa`
    mainWindow.loadURL(urlLocation)
})