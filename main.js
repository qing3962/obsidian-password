/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PasswordPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var ENCRYPT_KEY = 30;
var DEFAULT_SETTINGS = {
  protectedPath: "/",
  protectEnabled: false,
  password: ""
};
var PasswordPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.isVerifyPasswordWaitting = false;
    this.isVerifyPasswordCorrect = false;
  }
  async onload() {
    await this.loadSettings();
    if (this.settings.protectEnabled) {
      this.passwordRibbonBtn = this.addRibbonIcon("unlock", "Close password protection", (evt) => {
        this.switchPasswordProtection();
      });
    } else {
      this.passwordRibbonBtn = this.addRibbonIcon("lock", "Open password protection", (evt) => {
        this.switchPasswordProtection();
      });
    }
    this.addCommand({
      id: "Obsidian password: Open password protection",
      name: "Open password protection",
      callback: () => {
        this.OpenPasswordProtection();
      }
    });
    this.addSettingTab(new PasswordSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.protectEnabled && this.settings.protectedPath == "/") {
        if (!this.isVerifyPasswordCorrect) {
          this.closeLeaves(null);
          this.ClosePasswordProtection(null);
        }
      }
    });
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      if (file !== null) {
        if (this.settings.protectEnabled && !this.isVerifyPasswordCorrect && this.isProtectedFile(file)) {
          this.closeLeaves(file);
          this.ClosePasswordProtection(file);
        }
      }
    }));
  }
  onunload() {
  }
  // open note
  async openLeave(file) {
    var leaf = this.app.workspace.getLeaf(false);
    if (leaf != null && file != null) {
      leaf.openFile(file);
    }
  }
  // close notes
  async closeLeaves(file) {
    let leaves = [];
    this.app.workspace.iterateAllLeaves((leaf) => {
      leaves.push(leaf);
    });
    const emptyLeaf = async (leaf) => {
      leaf.setViewState({ type: "empty" });
    };
    for (const leaf of leaves) {
      if (leaf.view instanceof import_obsidian.FileView) {
        let needClose = false;
        if (file == null) {
          needClose = this.isProtectedFile(leaf.view.file);
        } else if (leaf.view.file.path == file.path) {
          needClose = true;
        }
        if (needClose) {
          await emptyLeaf(leaf);
          leaf.detach();
        }
      }
    }
  }
  // open or close password protection
  switchPasswordProtection() {
    if (this.settings.protectEnabled) {
      if (!this.isVerifyPasswordCorrect) {
        this.ClosePasswordProtection(null);
      } else {
        this.OpenPasswordProtection();
      }
    } else {
      this.OpenPasswordProtection();
    }
  }
  // open password protection
  OpenPasswordProtection() {
    if (!this.settings.protectEnabled) {
      new import_obsidian.Notice("Please set password in the Obsidian Password plugin firstly!");
    } else {
      if (this.isVerifyPasswordCorrect) {
        this.isVerifyPasswordCorrect = false;
      }
      this.closeLeaves(null);
      (0, import_obsidian.setIcon)(this.passwordRibbonBtn, "unlock");
      this.passwordRibbonBtn.ariaLabel = "Close password protection";
      new import_obsidian.Notice("Password protection is opened!");
    }
  }
  // close password protection
  ClosePasswordProtection(file) {
    if (!this.settings.protectEnabled) {
      (0, import_obsidian.setIcon)(this.passwordRibbonBtn, "lock");
      this.passwordRibbonBtn.ariaLabel = "Open password protection";
    } else {
      if (!this.isVerifyPasswordCorrect) {
        if (!this.isVerifyPasswordWaitting) {
          const setModal = new VerifyPasswordModal(this.app, this, () => {
            if (this.isVerifyPasswordCorrect) {
              if (file != null) {
                this.openLeave(file);
              }
              (0, import_obsidian.setIcon)(this.passwordRibbonBtn, "lock");
              this.passwordRibbonBtn.ariaLabel = "Open password protection";
              new import_obsidian.Notice("Password protection is closed!");
            }
          }).open();
        }
      }
    }
  }
  // check if the file need to be protected
  isProtectedFile(file) {
    if (file === null) {
      return false;
    }
    var path = file.path.toLowerCase();
    if (file.path[0] != "/") {
      path = "/" + path;
    }
    const lastSlashIndex = path.lastIndexOf("/");
    const filePath = path.substring(0, lastSlashIndex + 1);
    var protectedPath = this.settings.protectedPath.toLowerCase();
    if (protectedPath[0] != "/") {
      protectedPath = "/" + protectedPath;
    }
    if (protectedPath[protectedPath.length - 1] != "/") {
      protectedPath = protectedPath + "/";
    }
    if (filePath < protectedPath) {
      return false;
    }
    if (filePath.startsWith(this.settings.protectedPath)) {
      return true;
    }
    return false;
  }
  // encrypt password
  encrypt(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      if (charCode >= 33 && charCode <= 90) {
        result += String.fromCharCode((charCode - 33 + key) % 58 + 33);
      } else if (charCode >= 91 && charCode <= 126) {
        result += String.fromCharCode((charCode - 91 + key) % 36 + 91);
      } else {
        result += text.charAt(i);
      }
    }
    return result;
  }
  // decrypt password
  decrypt(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      if (charCode >= 33 && charCode <= 90) {
        result += String.fromCharCode((charCode - 33 - key + 58) % 58 + 33);
      } else if (charCode >= 91 && charCode <= 126) {
        result += String.fromCharCode((charCode - 91 - key + 36) % 36 + 91);
      } else {
        result += text.charAt(i);
      }
    }
    return result;
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var PasswordSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for obsidian password plugin." });
    new import_obsidian.Setting(containerEl).setName("The folder need to be protected").setDesc("With relative path, the '/' is the root path of vault folder").addText((text) => text.setPlaceholder("Enter path").setValue(this.plugin.settings.protectedPath).onChange(async (value) => {
      var path = value.toLowerCase();
      if (path.length == 0 || path[0] != "/") {
        path = "/" + path;
      }
      if (path[path.length - 1] != "/") {
        path = path + "/";
      }
      this.plugin.settings.protectedPath = path;
    })).setDisabled(this.plugin.settings.protectEnabled);
    new import_obsidian.Setting(containerEl).setName(`Enable protecting folder with password.`).setDesc(
      `A password will be required to enable or disable the protection.`
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.protectEnabled).onChange((value) => {
        if (value) {
          this.plugin.settings.protectEnabled = false;
          const setModal = new SetPasswordModal(this.app, this.plugin, () => {
            if (this.plugin.settings.protectEnabled) {
              this.plugin.saveSettings();
              this.plugin.OpenPasswordProtection();
            }
            this.display();
          }).open();
        } else {
          if (!this.plugin.isVerifyPasswordWaitting) {
            const setModal = new VerifyPasswordModal(this.app, this.plugin, () => {
              if (this.plugin.isVerifyPasswordCorrect) {
                this.plugin.settings.protectEnabled = false;
                this.plugin.saveSettings();
                this.plugin.ClosePasswordProtection(null);
              }
              this.display();
            }).open();
          }
        }
      })
    );
  }
};
var SetPasswordModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    var inputHint = [
      "Please enter your password in both boxes.",
      "Passwords must match.",
      "Password must be valid characters and contains 6~20 characters.",
      "Password is valid."
    ];
    const titleEl = contentEl.createDiv();
    titleEl.style.fontWeight = "bold";
    titleEl.style.marginBottom = "1em";
    titleEl.setText("Set a password to protect a folder");
    const inputPwContainerEl = contentEl.createDiv();
    inputPwContainerEl.style.marginBottom = "1em";
    const pwInputEl = inputPwContainerEl.createEl("input", { type: "password", value: "" });
    pwInputEl.placeholder = "Enter password, 6~20 characters";
    pwInputEl.style.width = "70%";
    pwInputEl.focus();
    const confirmPwContainerEl = contentEl.createDiv();
    confirmPwContainerEl.style.marginBottom = "1em";
    const pwConfirmEl = confirmPwContainerEl.createEl("input", { type: "password", value: "" });
    pwConfirmEl.placeholder = "Confirm your password";
    pwConfirmEl.style.width = "70%";
    const messageEl = contentEl.createDiv();
    messageEl.style.marginBottom = "1em";
    messageEl.setText("Please enter your password in both boxes.");
    messageEl.show();
    const buttonContainerEl = contentEl.createDiv();
    buttonContainerEl.style.marginBottom = "1em";
    const saveBtnEl = buttonContainerEl.createEl("button", { text: "Save" });
    saveBtnEl.style.marginLeft = "1em";
    const cancelBtnEl = buttonContainerEl.createEl("button", { text: "Cancel" });
    cancelBtnEl.style.marginLeft = "2em";
    const switchHint = (color, index) => {
      messageEl.style.color = color;
      messageEl.setText(inputHint[index]);
    };
    pwInputEl.addEventListener("input", (event) => {
      switchHint("", 0);
    });
    pwConfirmEl.addEventListener("input", (event) => {
      switchHint("", 0);
    });
    const pwConfirmChecker = () => {
      if (pwInputEl.value == "" || pwInputEl.value == null || pwConfirmEl.value == "" || pwConfirmEl.value == null) {
        switchHint("red", 0);
        return false;
      }
      if (typeof pwInputEl.value !== "string" || pwInputEl.value.length < 6 || pwInputEl.value.length > 20) {
        switchHint("red", 2);
        return false;
      }
      if (pwInputEl.value !== pwConfirmEl.value) {
        switchHint("red", 1);
        return false;
      }
      switchHint("", 0);
      return true;
    };
    const pwChecker = (ev) => {
      ev.preventDefault();
      let goodToGo = pwConfirmChecker();
      if (!goodToGo) {
        return;
      }
      var password = pwInputEl.value.normalize("NFC");
      const encryptedText = this.plugin.encrypt(password, ENCRYPT_KEY);
      this.plugin.settings.password = encryptedText;
      this.plugin.settings.protectEnabled = true;
      this.close();
    };
    saveBtnEl.addEventListener("click", pwChecker);
    const cancelEnable = (ev) => {
      ev.preventDefault();
      this.close();
    };
    cancelBtnEl.addEventListener("click", cancelEnable);
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.onSubmit();
  }
};
var VerifyPasswordModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.plugin = plugin;
    this.plugin.isVerifyPasswordWaitting = true;
    this.plugin.isVerifyPasswordCorrect = false;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const titleEl = contentEl.createDiv();
    titleEl.style.fontWeight = "bold";
    titleEl.style.marginBottom = "1em";
    titleEl.setText("Verify password");
    const inputPwContainerEl = contentEl.createDiv();
    inputPwContainerEl.style.marginBottom = "1em";
    const pwInputEl = inputPwContainerEl.createEl("input", { type: "password", value: "" });
    pwInputEl.placeholder = "Enter your password";
    pwInputEl.style.width = "70%";
    pwInputEl.focus();
    const messageEl = contentEl.createDiv();
    messageEl.style.marginBottom = "1em";
    messageEl.setText("Please enter you password to verify.");
    messageEl.show();
    const buttonContainerEl = contentEl.createDiv();
    buttonContainerEl.style.marginBottom = "1em";
    const saveBtnEl = buttonContainerEl.createEl("button", { text: "Ok" });
    saveBtnEl.style.marginLeft = "1em";
    const cancelBtnEl = buttonContainerEl.createEl("button", { text: "Cancel" });
    cancelBtnEl.style.marginLeft = "2em";
    pwInputEl.addEventListener("input", (event) => {
      messageEl.style.color = "";
      messageEl.setText("Please enter you password to verify.");
    });
    const pwConfirmChecker = () => {
      if (pwInputEl.value == "" || pwInputEl.value == null) {
        messageEl.style.color = "red";
        messageEl.setText("Password is empty.");
        return false;
      }
      if (typeof pwInputEl.value !== "string" || pwInputEl.value.length < 6 || pwInputEl.value.length > 20) {
        messageEl.style.color = "red";
        messageEl.setText("Password isn't match.");
        return false;
      }
      var password = pwInputEl.value.normalize("NFC");
      const decryptedText = this.plugin.decrypt(this.plugin.settings.password, ENCRYPT_KEY);
      if (password !== decryptedText) {
        messageEl.style.color = "red";
        messageEl.setText("Password isn't match.");
        return false;
      }
      messageEl.style.color = "";
      messageEl.setText("Password is right.");
      return true;
    };
    const pwChecker = (ev) => {
      ev.preventDefault();
      let goodToGo = pwConfirmChecker();
      if (!goodToGo) {
        return;
      }
      this.plugin.isVerifyPasswordCorrect = true;
      this.close();
    };
    saveBtnEl.addEventListener("click", pwChecker);
    const cancelEnable = (ev) => {
      ev.preventDefault();
      this.close();
    };
    cancelBtnEl.addEventListener("click", cancelEnable);
  }
  onClose() {
    this.plugin.isVerifyPasswordWaitting = false;
    const { contentEl } = this;
    contentEl.empty();
    this.onSubmit();
  }
};
