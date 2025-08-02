declare module 'pptxgenjs' {
  export default class PptxGenJS {
    title: string;
    subject: string;
    author: string;
    
    addSlide(): any;
    write(type: string): Promise<Buffer>;
  }

  export = PptxGenJS;
}