import typescript = require('typescript');

export interface LoaderOptions {
    silent: boolean;
    instance: string;
    compiler: string;
    configFileName: string;
    transpileOnly: boolean;
    ignoreDiagnostics: number[];
    compilerOptions: typescript.CompilerOptions;
}

export interface TSFile {
    text: string;
    version: number;
}

export interface TSFiles {
    [fileName: string]: TSFile;
}

export interface TSInstance {
    compiler: typeof typescript;
    compilerOptions: typescript.CompilerOptions;
    loaderOptions: LoaderOptions;
    files: TSFiles;
    languageService?: typescript.LanguageService;
    version?: number;
    dependencyGraph: any;
}

export interface TSInstances {
    [name: string]: TSInstance;
}

export interface WebpackError {
    module?: any;
    file?: string;
    message: string;
    rawMessage: string;
    location?: {line: number, character: number};
    loaderSource: string;
}

export interface ResolvedModule {
    resolvedFileName?: string;
    resolvedModule?: ResolvedModule;
    isExternalLibraryImport?: boolean;
}

