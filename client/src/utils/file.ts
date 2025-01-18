function getLanguageFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const languageMap: { [key: string]: string } = {
        js: 'javascript',
        ts: 'typescript',
        json: 'json',
        html: 'html',
        css: 'css',
        java: 'java',
        py: 'python',
        cs: 'csharp',
        cpp: 'cpp',
        c: 'c',
        go: 'go',
        php: 'php',
        rb: 'ruby',
        swift: 'swift',
        kt: 'kotlin',
        md: 'markdown',
        xml: 'xml',
        yaml: 'yaml',
        sh: 'bash',
        txt: 'text', // Treat plain text as "text"
    };

    return languageMap[extension || ''] || 'plaintext'; // Default to 'plaintext'
}

export { getLanguageFromExtension };