/**
 * Aegis Virtual File System
 * Simulates real Windows file operations locally.
 */

export interface AegisFile {
  id: string;
  name: string;
  type: 'word' | 'excel' | 'code' | 'folder' | 'image';
  path: string;
  size: string;
  lastModified: string;
  content?: string;
}

export class VirtualFS {
  private files: AegisFile[] = [
    { 
      id: '1', 
      name: 'Project_Alpha.ts', 
      type: 'code', 
      path: 'C:/Projects/Alpha', 
      size: '12 KB', 
      lastModified: '2026-04-01',
      content: `import { Aegis } from './core';\n\nexport const startProject = () => {\n  console.log("Aegis System Initializing...");\n  Aegis.boot();\n};`
    },
    { 
      id: '2', 
      name: 'Financial_Report.xlsx', 
      type: 'excel', 
      path: 'C:/Documents', 
      size: '45 KB', 
      lastModified: '2026-04-03',
      content: 'Sheet 1: Q1 Revenue - $1.2M\nSheet 2: Operational Costs - $400K\nSheet 3: Net Profit - $800K'
    },
    { 
      id: '3', 
      name: 'System_Logs.txt', 
      type: 'code', 
      path: 'C:/Windows/Logs', 
      size: '2 MB', 
      lastModified: '2026-04-05',
      content: '[2026-04-05 08:00:01] INFO: System boot sequence initiated.\n[2026-04-05 08:00:05] SUCCESS: Biometric module online.\n[2026-04-05 08:00:10] WARNING: Network latency detected in sector 7.'
    },
    {
      id: '4',
      name: 'Security_Blueprint.png',
      type: 'image',
      path: 'C:/Users/Boss/Pictures',
      size: '1.5 MB',
      lastModified: '2026-04-04',
      content: 'https://picsum.photos/seed/aegis-security/1200/800'
    }
  ];

  public getFiles() {
    return [...this.files];
  }

  public createFile(name: string, type: AegisFile['type']) {
    const newFile: AegisFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: name + (type === 'excel' ? '.xlsx' : type === 'word' ? '.docx' : '.ts'),
      type,
      path: 'C:/Users/Boss/Desktop',
      size: '0 KB',
      lastModified: new Date().toISOString().split('T')[0],
    };
    this.files.push(newFile);
    return newFile;
  }

  public deleteFile(id: string) {
    const index = this.files.findIndex(f => f.id === id);
    if (index !== -1) {
      this.files.splice(index, 1);
      return true;
    }
    return false;
  }

  public scanFolder(path: string) {
    // Simulate a deep scan
    return this.files.filter(f => f.path.startsWith(path));
  }
}

export const aegisFS = new VirtualFS();
