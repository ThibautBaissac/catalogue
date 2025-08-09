import { ipcMain } from 'electron';

// Generic response envelope used everywhere for simplicity.
export interface IpcOk<T = any> { success: true; data: T; }
export interface IpcFail { success: false; error: string; }
export type IpcResponse<T = any> = IpcOk<T> | IpcFail;

type HandlerFn<In, Out> = (input: In) => Out | Promise<Out>;

function ok<T>(data: T | null = null): IpcOk<T | null> { return { success: true, data }; }
function fail(message: string): IpcFail { return { success: false, error: message }; }

/** Register a channel with automatic try/catch + envelope. */
export function registerIpc<In = any, Out = any>(channel: string, handler: HandlerFn<In, Out>) {
  ipcMain.handle(channel, async (_event, input: In): Promise<IpcResponse<Out>> => {
    try {
      const result = await handler(input);
      return ok(result as any);
    } catch (e: any) {
      return fail(e?.message || 'Unknown error');
    }
  });
}

export const responseHelpers = { ok, fail };
