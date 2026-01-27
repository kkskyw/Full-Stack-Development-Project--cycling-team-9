window.VoiceSystem = {
  commands: {},

  register(command, handler) {
    this.commands[command] = handler;
  },

  execute(command) {
    if (this.commands[command]) {
      this.commands[command]();
      return true;
    }
    return false;
  }
};
