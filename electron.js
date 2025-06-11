
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Adicione um ícone
    show: false
  });

  // Carregar a aplicação
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
    
  mainWindow.loadURL(startUrl);

  // Mostrar quando estiver pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools apenas em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menu da aplicação
const template = [
  {
    label: 'Arquivo',
    submenu: [
      {
        label: 'Novo Projeto',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('new-project');
        }
      },
      {
        label: 'Exportar PDF',
        accelerator: 'CmdOrCtrl+E',
        click: () => {
          mainWindow.webContents.send('export-pdf');
        }
      },
      { type: 'separator' },
      {
        label: 'Sair',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Visualizar',
    submenu: [
      {
        label: 'Dashboard',
        accelerator: 'CmdOrCtrl+1',
        click: () => {
          mainWindow.webContents.send('navigate-to', '/dashboard');
        }
      },
      {
        label: 'Projetos',
        accelerator: 'CmdOrCtrl+2',
        click: () => {
          mainWindow.webContents.send('navigate-to', '/projects');
        }
      },
      {
        label: 'Analytics',
        accelerator: 'CmdOrCtrl+3',
        click: () => {
          mainWindow.webContents.send('navigate-to', '/analytics');
        }
      },
      { type: 'separator' },
      {
        label: 'Recarregar',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          mainWindow.reload();
        }
      },
      {
        label: 'Ferramentas do Desenvolvedor',
        accelerator: 'F12',
        click: () => {
          mainWindow.toggleDevTools();
        }
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => {
          // Implementar dialog sobre
        }
      },
      {
        label: 'Obter Ajuda',
        click: () => {
          require('electron').shell.openExternal('mailto:danilo.s.loureiro2@gmail.com?subject=Ajuda - Sistema de Gerência de Projetos');
        }
      }
    ]
  }
];

app.whenReady().then(() => {
  createWindow();
  
  // Configurar menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
