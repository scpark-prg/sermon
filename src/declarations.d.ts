declare module 'html-to-markdown' {
    export default class Converter {
        convert(html: string): string;
    }
}

declare module '*.md' {
    const content: string;
    export default content;
}
