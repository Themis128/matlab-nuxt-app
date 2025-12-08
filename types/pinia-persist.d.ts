import 'pinia';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
          key?: string;
          storage?: Storage | undefined;
          paths?: string[];
          serializer?: {
            serialize: (value: any) => string;
            deserialize: (value: string) => any;
          };
          beforeRestore?: (ctx: any) => void;
          afterRestore?: (ctx: any) => void;
          debug?: boolean;
        };
  }
}
