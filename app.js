const {app, BrowserWindow, ipcMain, Menu, shell, nativeTheme, dialog} = require('electron');
const marked = require('marked');
const Store = require('electron-store');
const fs = require('fs');

let menu_template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New',
                accelerator: 'CmdOrCtrl+n',
                click() {
                    createEditor();
                }
            },
            {
                label: 'Open...',
                accelerator: 'CmdOrCtrl+o',
                click(menuItem, browserWindow, _) {
                    openFile(browserWindow);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+s',
                click(menuItem, browserWindow, event) {
                    saveFile(browserWindow);
                }
            },
            {
                label: 'Save As...',
                accelerator: 'CmdOrCtrl+shift+s',
                click(menuItem, browserWindow, event) {
                    saveAs(browserWindow);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Settings',
                accelerator: 'CmdOrCtrl+,',
                click() {
                    createSettings();
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                role: 'undo'
            },
            {
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut'
            },
            {
                role: 'copy'
            },
            {
                role: 'paste'
            },
            {
                role: 'delete'
            },
            {
                type: 'separator'
            },
            {
                role: 'selectAll'
            }
        ]
    },
    {
        label: 'Insert',
        submenu: [
            {
                label: 'Heading',
                submenu: [
                    {
                        label: 'h1',
                        accelerator: 'CmdOrCtrl+1',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '# ', '');
                        }
                    },
                    {
                        label: 'h2',
                        accelerator: 'CmdOrCtrl+2',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '## ', '');
                        }
                    }
                    ,
                    {
                        label: 'h3',
                        accelerator: 'CmdOrCtrl+3',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '### ', '');
                        }
                    }
                    ,
                    {
                        label: 'h4',
                        accelerator: 'CmdOrCtrl+4',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '#### ', '');
                        }
                    }
                    ,
                    {
                        label: 'h5',
                        accelerator: 'CmdOrCtrl+5',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '##### ', '');
                        }
                    }
                    ,
                    {
                        label: 'h6',
                        accelerator: 'CmdOrCtrl+6',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '###### ', '');
                        }
                    }
                ]
            },
            {
                label: 'Format',
                submenu: [
                    {
                        label: 'Bold',
                        accelerator: 'CmdOrCtrl+b',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '**', '**');
                        }
                    },
                    {
                        label: 'Italic',
                        accelerator: 'CmdOrCtrl+i',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '*', '*');
                        }
                    },
                    {
                        label: 'Strikethrough',
                        accelerator: 'CmdOrCtrl+d',
                        click(menuItem, browserWindow, event){
                            insertText(browserWindow, '~~', '~~');
                        }
                    }
                ]
            },
            {
                type: 'separator'
            },
            {
                label: 'Code',
                accelerator: 'CmdOrCtrl+shift+c',
                click(menuItem, browserWindow, event){
                    insertText(browserWindow, '`', '`');
                }
            },
            {
                label: 'Code Block',
                accelerator: 'CmdOrCtrl+alt+c',
                click(menuItem, browserWindow, event){
                    insertText(browserWindow, '```', '\r\n```');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'MathJax',
                accelerator: 'CmdOrCtrl+shift+m',
                click(menuItem, browserWindow, event){
                    insertText(browserWindow, '\\\\(', '\\\\)');
                }
            },
            {
                label: 'MathJax Block',
                accelerator: 'CmdOrCtrl+alt+m',
                click(menuItem, browserWindow, event){
                    insertText(browserWindow, '$$', '$$');
                }
            },
            // {
            //     type: 'separator'
            // },
            // {
            //     label: 'Table',
            //     accelerator: 'CmdOrCtrl+t',
            //     click(menuItem, browserWindow, event){
            //     }
            // }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                role: 'reload'
            },
            {
                role: 'forceReload'
            },
            {
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: () => {
                    shell.openExternal('https://github.com/sparkmemo/sparkdown');
                }
            },
            {
                label: 'Version: 0.1.0 (Beta)'
            },
            {
                label: 'Release Date: 2020/01/01'
            }
        ]
    },
];

let editor;
let settings;

const menu = Menu.buildFromTemplate(menu_template);
Menu.setApplicationMenu(menu);
const store = new Store();
store.set('settings.fontFamily', '"Ubuntu Mono", sans-serif');

function createEditor() {
    editor = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    });

    editor.loadFile('view/editor.html');

    editor.on('closed', () => {
        editor = null;
    })
}

function createSettings() {
    settings = new BrowserWindow({
        width: 480,
        height: 540,
        webPreferences: {
            nodeIntegration: true
        }
    });

    settings.loadFile('view/settings.html');
    settings.setAlwaysOnTop(true);

    settings.on('closed', () => {
        settings = null;
    })
}

app.on('ready', createEditor);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (editor === null) {
        createEditor()
    }
});


ipcMain.on('render-md', (event, md_src) => {
    // console.log('rendering:', md_src);
    event.reply('render-md-result', marked(md_src));
});

ipcMain.on('request-user-settings', (event) => {
    console.log('User settings:', store.get('settings'));
    event.reply('user-settings-result', store.get('settings'));
});

ipcMain.on('change-user-settings', (event, new_settings) => {
    // console.log('New user settings:', new_settings);
    store.set('settings', new_settings);
    editor.webContents.send('user-settings-result', store.get('settings'));
});

ipcMain.on('close-settings-window', (event) => {
    settings.close();
});

ipcMain.on('md-process-drag-drop', (event, file) => {
    console.log(`Processing drag&drop file: ${file.name}`);
    let fileNameArray = file.name.split('.');
    let file_suffix = fileNameArray[fileNameArray.length - 1];
    let img_suffix = new RegExp(/^(jpg|png)$/);
    let md_suffix = new RegExp(/^(md)$/);
    if(img_suffix.test(file_suffix)){
        let img_md = `\n![](file://${encodeURI(file.path)})\n`;
        editor.webContents.send('patch-md-src', img_md);
    } else if(md_suffix.test(file_suffix)) {
        let contents = fs.readFileSync(file.path,'utf8');
        editor.webContents.send('put-md-src', contents);
        editor.setTitle(`SparkDown - ${file.name}`);
    }
});

ipcMain.on('get-md-src-result', (event, get_md_result) => {
    console.log(get_md_result);
});

function insertText(window, prefix, suffix) {
    window.webContents.send('patch-md-src', prefix, suffix);
}

function openFile(window) {
    let path = dialog.showOpenDialogSync(window, {
        title: 'Open File...',
        filters: [
            {
                name: 'Markdown Files',
                extensions: ['md']
            },
            {
                name: 'All Files',
                extensions: ['*']
            }
        ],
        properties: ['openFile']
    });

    let contents = fs.readFileSync(path[0],'utf8');
    // console.log(contents);
    window.webContents.send('put-md-src', contents);

    let fileName = path[0].replace(/^.*[\\\/]/, '');
    window.setTitle(`SparkDown - ${fileName}`);
}

function saveFile(window) {
    let path = dialog.showSaveDialogSync(window, {
        title: 'Save File',
        filters: [
            {
                name: 'Markdown Files',
                extensions: ['md']
            },
            {
                name: 'All Files',
                extensions: ['*']
            }
        ]
    });

    window.webContents.executeJavaScript('document.getElementById(\'md-src\').value').then((content) => {
        fs.writeFileSync(path, content);
    });

    let fileName = path.replace(/^.*[\\\/]/, '');
    window.setTitle(`SparkDown - ${fileName}`);
}