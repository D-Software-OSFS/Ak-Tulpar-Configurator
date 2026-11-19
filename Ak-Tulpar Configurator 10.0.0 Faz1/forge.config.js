import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Remove SITL binaries for other platforms/architectures to reduce package size.
// This must run via afterCopyExtraResources (before code signing) rather than
// postPackage, otherwise deleting files invalidates the macOS signature seal.
const pruneSitlBinaries = (stagingPath, electronVersion, platform, arch, done) => {
  try {
    let sitlPath;

    if (platform === 'darwin') {
      const appBundle = fs.readdirSync(stagingPath).find((name) => name.endsWith('.app'));
      if (!appBundle) {
        console.log(`pruneSitlBinaries: no .app bundle found in ${stagingPath}, skipping`);
        return done();
      }
      sitlPath = path.join(stagingPath, appBundle, 'Contents', 'Resources', 'sitl');
    } else {
      sitlPath = path.join(stagingPath, 'resources', 'sitl');
    }

    console.log(`pruneSitlBinaries: Checking SITL path for ${platform}: ${sitlPath}`);
    if (!fs.existsSync(sitlPath)) {
      console.log(`pruneSitlBinaries: SITL path not found, skipping: ${sitlPath}`);
      return done();
    }

    if (platform === 'win32') {
      console.log('pruneSitlBinaries: Removing non-Windows SITL binaries (linux, macos)');
      fs.rmSync(path.join(sitlPath, 'linux'), { recursive: true, force: true });
      fs.rmSync(path.join(sitlPath, 'macos'), { recursive: true, force: true });
    } else if (platform === 'darwin') {
      console.log('pruneSitlBinaries: Removing non-macOS SITL binaries (linux, windows)');
      fs.rmSync(path.join(sitlPath, 'linux'), { recursive: true, force: true });
      fs.rmSync(path.join(sitlPath, 'windows'), { recursive: true, force: true });
    } else if (platform === 'linux') {
      console.log('pruneSitlBinaries: Removing non-Linux SITL binaries (macos, windows)');
      fs.rmSync(path.join(sitlPath, 'macos'), { recursive: true, force: true });
      fs.rmSync(path.join(sitlPath, 'windows'), { recursive: true, force: true });
      if (arch === 'x64') {
        fs.rmSync(path.join(sitlPath, 'linux', 'arm64'), { recursive: true, force: true });
      } else if (arch === 'arm64') {
        const arm64Binary = path.join(sitlPath, 'linux', 'arm64', 'inav_SITL');
        const destBinary = path.join(sitlPath, 'linux', 'inav_SITL');
        if (fs.existsSync(arm64Binary)) {
          fs.rmSync(destBinary, { force: true });
          fs.renameSync(arm64Binary, destBinary);
          fs.rmSync(path.join(sitlPath, 'linux', 'arm64'), { recursive: true, force: true });
        }
      }
    }

    done();
  } catch (err) {
    done(err);
  }
};

const osxSign = process.env.OSX_SIGN_IDENTITY
  ? { identity: process.env.OSX_SIGN_IDENTITY }
  : undefined;

const appleApiKey = process.env.APPLE_API_KEY;
const hasApiKeyNotarize = Boolean(
  appleApiKey &&
  process.env.APPLE_API_KEY_ID &&
  process.env.APPLE_API_ISSUER &&
  fs.existsSync(appleApiKey)
);

let osxNotarize;
if (osxSign && hasApiKeyNotarize) {
  osxNotarize = {
    appleApiKey,
    appleApiKeyId: process.env.APPLE_API_KEY_ID,
    appleApiIssuer: process.env.APPLE_API_ISSUER,
  };
} else if (osxSign && process.env.APPLE_KEYCHAIN_PROFILE) {
  osxNotarize = { keychainProfile: process.env.APPLE_KEYCHAIN_PROFILE };
}

export default {
  packagerConfig: {
    executableName: "ak-tulpar-configurator",
    asar: false,
    icon: 'images/aktulpar',
    osxSign,
    osxNotarize,
    extraResource: [
      'resources/public/sitl',
      'assets/linux/45-inav.rules'
    ],
    afterCopyExtraResources: [pruneSitlBinaries],
  },
  rebuildConfig: {
    onlyModules: [],
  },
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'js/main/main.js',
            config: 'vite.main.config.js',
          },
          {
            entry: 'js/main/preload.js',
            config: 'vite.preload.config.js',
          },
          {
            entry: 'js/libraries/bluetooth-device-chooser/bt-device-chooser-preload.js',
            config: 'vite.preload.config.js',
          },
        ],
        renderer: [
          {
            name: 'bt_device_chooser',
            config: 'vite.bt-dc-renderer.config.js',
          },
          {
            name: 'main_window',
            config: 'vite.main-renderer.config.js',
          },
        ],
      },
    },
  ],
  hooks: {
    preMake: async () => {
      if (process.platform !== 'darwin') {
        return;
      }
      for (const vol of ['/Volumes/AK-Tulpar-Configurator', '/Volumes/AK-Tulpar Configurator', '/Volumes/INAV-Configurator', '/Volumes/INAV Configurator']) {
        try {
          execFileSync('/usr/bin/hdiutil', ['detach', vol, '-force'], { stdio: 'ignore' });
        } catch {}
      }
    },
    postMake: async (config, makeResults) => {
      makeResults.forEach(result => {
        var baseName = `${result.packageJSON.productName.replace(' ', '-')}_${result.platform}_${result.arch}_${result.packageJSON.version}`;
        result.artifacts.forEach(artifact => {
          var artifactStr = artifact.toString();
          var newPath = path.join(path.dirname(artifactStr), baseName + path.extname(artifactStr));
          newPath = newPath.replace('AK-Tulpar-Configurator_win32_ia32', 'AK-Tulpar-Configurator_Win32');
          newPath = newPath.replace('AK-Tulpar-Configurator_win32_x64', 'AK-Tulpar-Configurator_Win64');
          newPath = newPath.replace('AK-Tulpar-Configurator_darwin', 'AK-Tulpar-Configurator_MacOS');
          newPath = newPath.replace('Configurator_win32_ia32', 'Configurator_Win32');
          newPath = newPath.replace('Configurator_win32_x64', 'Configurator_Win64');
          newPath = newPath.replace('Configurator_darwin', 'Configurator_MacOS');
          fs.renameSync(artifactStr, newPath);
          console.log('Artifact: ' + newPath);
        });
      });
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: "AK-Tulpar Configurator",
        shortName: "AK-Tulpar",
        exe: "ak-tulpar-configurator",
        description: "AK-Tulpar IHA Takimi icin D Software tarafindan ozellestirilmis INAV tabanli yer kontrol istasyonu.",
        programFilesFolderName: "ak-tulpar-configurator",
        shortcutFolderName: "AK-Tulpar",
        manufacturer: "D Software - AK-Tulpar IHA Takimi",
        appUserModelId: "com.aktulpar.configurator",
        icon: path.join(__dirname, "./assets/windows/aktulpar_installer_icon.ico"),
        upgradeCode: "13606ff3-b0bc-4dde-8fac-805bc8aed2f8",
        ui: {
          enabled: false,
          chooseDirectory: true,
          images: {
            background: path.join(__dirname, "./assets/windows/background.jpg"),
            banner: path.join(__dirname, "./assets/windows/banner.jpg")
          }
        },
        beforeCreate: (msiCreator) => {
          return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname,"./assets/windows/wix.xml"), "utf8" , (err, content) => {
                if (err) {
                    reject (err);
                }
                msiCreator.wixTemplate = content;
                resolve();
            });
          });
        }
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: "AK-Tulpar-Configurator",
        title: "AK-Tulpar-Configurator",
        background: "./assets/osx/dmg-background.png",
        icon: "./images/aktulpar.icns"
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'linux', 'darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: "ak-tulpar-configurator",
          productName: "AK-Tulpar Configurator",
          categories: ["Utility"],
          icon: "./assets/linux/icon/aktulpar_icon_128.png",
          description: "AK-Tulpar IHA Takimi icin D Software tarafindan ozellestirilmis INAV tabanli yer kontrol istasyonu.",
          homepage: "https://github.com/inavflight/",
          scripts: {
            postinst: "./assets/linux/postinst",
            postrm: "./assets/linux/postrm",
          },
        }
      },
    },
  ],
};