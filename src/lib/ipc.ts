import { invoke } from "@tauri-apps/api/core";

export type Runtime = "node" | "python" | "custom";
export type BotStatus = "running" | "stopped" | "crashed" | "starting" | "stopping";
export type AutoRestart = "never" | "on_crash" | "always";

export interface ManagedBot {
  id: string;
  name: string;
  path: string;
  runtime: Runtime;
  entryPoint: string;
  args: string[];
  autoRestart: AutoRestart;
  status: BotStatus;
  pid?: number;
  cpuPct?: number;
  memMb?: number;
  uptimeSecs?: number;
  crashCount: number;
  lastCrashAt?: string;
  createdAt: string;
}

export interface StatusEvent {
  botId: string;
  status: BotStatus;
  pid?: number;
}

export interface CloneProgress {
  botId: string;
  phase: string;
  percent: number;
  bytesReceived: number;
}

export interface BotMetrics {
  botId: string;
  cpuPct: number;
  memMb: number;
  uptimeSecs: number;
}

export interface LogEntry {
  id: number;
  botId: string;
  ts: string;
  stream: "stdout" | "stderr";
  message: string;
}

export interface EnvVar {
  id: string;
  botId: string;
  key: string;
  valueEnc: number[];
  nonce: number[];
}

export interface RestartEvent {
  id: number;
  botId: string;
  reason: "manual" | "crash" | "auto";
  exitCode?: number;
  ts: string;
}

export const Cmd = {
  listBots: "list_bots",
  getBot: "get_bot",
  createBot: "create_bot",
  updateBot: "update_bot",
  deleteBot: "delete_bot",
  startBot: "start_bot",
  stopBot: "stop_bot",
  restartBot: "restart_bot",
  getLogs: "get_bot_logs",
  clearLogs: "clear_bot_logs",
  getMetrics: "get_metrics",
  setEnvVar: "set_env_var",
  deleteEnvVar: "delete_env_var",
  listEnvVars: "list_env_vars",
  cloneRepo: "clone_repo",
  detectRuntime: "detect_runtime",
  installDeps: "install_deps",
  getSetting: "get_setting",
  setSetting: "set_setting",
  listSettings: "list_settings",
} as const;

export const getBots = () => invoke<ManagedBot[]>(Cmd.listBots);
export const getBot = (id: string) => invoke<ManagedBot>(Cmd.getBot, { id });
export const createBot = (bot: Omit<ManagedBot, "id" | "status" | "crashCount" | "createdAt">) =>
  invoke<ManagedBot>(Cmd.createBot, { bot });
export const updateBot = (id: string, bot: Partial<ManagedBot>) =>
  invoke<ManagedBot>(Cmd.updateBot, { id, bot });
export const deleteBot = (id: string) => invoke<void>(Cmd.deleteBot, { id });
export const startBot = (id: string) => invoke<void>(Cmd.startBot, { id });
export const stopBot = (id: string) => invoke<void>(Cmd.stopBot, { id });
export const restartBot = (id: string) => invoke<void>(Cmd.restartBot, { id });
export const getBotLogs = (id: string, limit: number, cursor?: number) =>
  invoke<LogEntry[]>(Cmd.getLogs, { id, limit, cursor });
export const clearBotLogs = (id: string) => invoke<number>(Cmd.clearLogs, { id });
export const getMetrics = () => invoke<BotMetrics[]>(Cmd.getMetrics);
export const setEnvVar = (botId: string, key: string, value: string) =>
  invoke<void>(Cmd.setEnvVar, { botId, key, value });
export const deleteEnvVar = (botId: string, key: string) =>
  invoke<void>(Cmd.deleteEnvVar, { botId, key });
export const listEnvVars = (botId: string) =>
  invoke<EnvVar[]>(Cmd.listEnvVars, { botId });
export const cloneRepo = (url: string, botId: string) =>
  invoke<void>(Cmd.cloneRepo, { url, botId });
export const detectRuntime = (path: string) =>
  invoke<{ runtime: Runtime; entryPoint: string; provenance: string }>(Cmd.detectRuntime, { path });
export const installDeps = (botId: string) =>
  invoke<void>(Cmd.installDeps, { botId });

export const getSetting = (key: string) => invoke<string | null>(Cmd.getSetting, { key });
export const setSetting = (key: string, value: string) => invoke<void>(Cmd.setSetting, { key, value });
export const listSettings = () => invoke<{ key: string; value: string }[]>(Cmd.listSettings);
