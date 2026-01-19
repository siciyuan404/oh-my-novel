/**
 * Minimal type definitions for opencode
 * This is a temporary stub for compilation testing
 */

export interface Tool {
  name?: string;
  description?: string;
  parameters?: any;
  handler?: (...args: any[]) => Promise<any> | any;
  execute?: (...args: any[]) => Promise<any>;
}

export interface Agent {
  name?: string;
  model: string;
  temperature?: number;
  permission?:
    | string[]
    | {
        edit?: "ask" | "allow" | "deny";
        bash?:
          | "ask"
          | "allow"
          | "deny"
          | Record<string, "ask" | "allow" | "deny">;
        webfetch?: "ask" | "allow" | "deny";
        external_directory?: "ask" | "allow" | "deny";
      };
  systemPrompt?: string;
  top_p?: number;
  maxTokens?: number;
  tools?: Record<string, boolean>;
  prompt_append?: string;
  prompt?: string;
  disable?: boolean;
  description?: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  agents?: Record<string, Agent>;
  tools?: Record<string, any>; // Allow both Tool and Record<string, Tool>
  hooks?: Record<string, Hook>;
  skills?: Record<string, any>; // Allow flexible skill types
  config?: any;
}

export interface Hook {
  description?: string;
  type?: string;
  execute?: (...args: any[]) => Promise<any> | any;
  handler?: (...args: any[]) => Promise<any> | any;
  [key: string]: any; // Allow dynamic properties like "event", "chat.message", etc.
}

export interface Skill {
  name?: string;
  description?: string;
  instructions?: string;
  model?: string;
  temperature?: number;
  agents?: Record<string, any>;
  tools?: any[];
  template?: string;
  enabled?: boolean;
  from?: string;
  prompt?: string;
}

// Task config for background tasks
export interface TaskConfig {
  default?: {
    agent?: string;
    model?: string;
    temperature?: number;
    concurrency?: number;
  };
  defaultConcurrency?: number;
  byModel?: Record<
    string,
    {
      agent?: string;
      temperature?: number;
    }
  >;
  concurrency?: {
    default: number;
    byModel?: Record<string, number>;
  };
}

// Notification type (stub)
declare var Notification: any;

// Zod error type stub
export interface ZodErrorStub {
  errors?: any[];
  issues?: any[];
}

// Bun test types (stub)
export interface BunTest {
  describe(name: string, fn: () => void): void;
  it(name: string, fn: () => void | Promise<void>): void;
  expect(value: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toThrow(): void;
    toHaveLength(length: number): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
  };
}

declare module "bun:test" {
  const test: BunTest;
  export default test;
}

export interface Agent {
  name?: string;
  model: string;
  temperature?: number;
  permission?:
    | string[]
    | {
        edit?: "ask" | "allow" | "deny";
        bash?:
          | "ask"
          | "allow"
          | "deny"
          | Record<string, "ask" | "allow" | "deny">;
        webfetch?: "ask" | "allow" | "deny";
        external_directory?: "ask" | "allow" | "deny";
      };
  systemPrompt?: string;
  top_p?: number;
  maxTokens?: number;
  tools?: Record<string, boolean>;
  prompt_append?: string;
  prompt?: string;
  disable?: boolean;
  description?: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  agents?: Record<string, Agent>;
  tools?: Record<string, Tool>;
  hooks?: Record<string, Hook>;
  skills?: Record<string, Skill>;
  config?: any;
}

export interface Hook {
  description?: string;
  type?: string;
  execute?: (...args: any[]) => Promise<any> | any;
  handler?: (...args: any[]) => Promise<any> | any;
  [key: string]: any; // Allow dynamic properties like "event", "chat.message", etc.
}

export interface Skill {
  name: string;
  description: string;
  instructions?: string;
  model?: string;
  temperature?: number;
  agents?: Record<string, any>;
  template?: string;
  enabled?: boolean;
}

// Task config for background tasks
export interface TaskConfig {
  default?: {
    agent?: string;
    model?: string;
    temperature?: number;
  };
  byModel?: Record<
    string,
    {
      agent?: string;
      temperature?: number;
    }
  >;
}

// Notification type (stub)
declare var Notification: any;

// Bun test types (stub)
export interface BunTest {
  describe(name: string, fn: () => void): void;
  it(name: string, fn: () => void | Promise<void>): void;
  expect(value: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toThrow(): void;
    toHaveLength(length: number): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
  };
}

declare module "bun:test" {
  const test: BunTest;
  export default test;
}
